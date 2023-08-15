/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import { Table, Dropdown, Form } from "react-bootstrap";
import PagesPagination from "./PagesPagination";
import QRCodeModal from "./QRCodeModal";
import axios from "axios";

export default function PagesTable() {
  const [myValues, setMyValues] = useContext(MyContext);
  const [currentPages, setCurrentPages] = useState([]); 
  const [loading, setLoading] = useState(false);
  const initialLoad = useRef(true);

  async function getPageData(page) {
    setLoading(true);
    const telegraphGetPage = "https://api.telegra.ph/getPage/";
    const pagePath = page.path;
    const return_content = "?return_content=true";

    const apiCallGetPage = telegraphGetPage + pagePath + return_content;

    axios
      .post(apiCallGetPage)
      .then(function (response) {
        if (response.data.ok) {
          const content = response.data.result.content;
          const title = response.data.result.title;
          setTimeout(() => {

            const newPageDate = "[date=" + page.pageDate + "]";
            if (
              content[0].tag === "p" &&
              typeof content[0].children[0] == "string"
            ) {
              const optionsFound =
                content[0].children[0].match(/\[date=([0-9-]+)\]/);
              if (optionsFound != null) {
                content[0].children[0] = newPageDate;
              } else {
                const newPTag = {
                  tag: "p",
                  children: [newPageDate],
                };
                content.unshift(newPTag);
              }
            } else {
              const newPTag = {
                tag: "p",
                children: [newPageDate],
              };
              content.unshift(newPTag);
            }
            updatePageData(pagePath, title, JSON.stringify(content));
          }, 100);
        } else {
          setLoading(false);
          console.log(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function updatePageData(pagePath, title, content) {
    var data = new FormData();
    data.append("access_token", myValues.currentAccessToken);
    data.append("title", title);
    data.append("content", content);

    var config = {
      method: "post",
      url: "https://api.telegra.ph/editPage/" + pagePath,
      headers: {
        "content-type": "text/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        if (response.data.ok) {
          setLoading(false);
        } else {
          setLoading(false);
          console.log(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function getCurrentPages(pages) {
    console.log("getCurrentPages()");
    var filteredPages = [];

    if (myValues.showDeletedPages) {
      filteredPages = pages;
    } else {
      filteredPages = pages.filter(function (page) {
        return !page.deleted;
      });
    }

    const offset =
      (myValues.currentPaginationPage - 1) * parseInt(myValues.pagesPerSite);
    const limit = offset + parseInt(myValues.pagesPerSite);
    const tempCurrentPages = filteredPages.slice(offset, limit);
    setCurrentPages(tempCurrentPages);
  }

  function handlePageDelete(page) {
    setMyValues((oldValues) => ({
      ...oldValues,
      showDeletePageModal: true,
      deletePagePath: page.path,
      deletePageTitle: page.title,
    }));
  }
  function handlePageQrCode(page) {
    setMyValues((oldValues) => ({
      ...oldValues,
      showQRCodeModal: true,
      currentSelectedPage: page,
    }));
  }
  function handleToggle(dropdownOpen, currentPage) {
    if (!dropdownOpen && currentPage.pageDateChanged) {
      currentPage.pageDateChanged = false;
      getPageData(currentPage);
    }
  }

  useEffect(() => {
    if (!initialLoad.current) {
      if (myValues.pageFilter !== "" || myValues.sortFilter !== "") {
        getCurrentPages(myValues.filteredPages);
      }
      else {
        getCurrentPages(myValues.allPages);
      }
    }
  }, [myValues.currentPaginationPage, myValues.pagesPerSite, myValues.showDeletedPages, myValues.showDeletePageModal, myValues.filteredPages, myValues.pageFilter, myValues.sortFilter, myValues.allPages, getCurrentPages]);

  useEffect(() => {
    initialLoad.current = false;
  }, []);

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <span
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
      <span
        style={{
          cursor: "pointer",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
        </svg>
      </span>
    </span>
  ));

  const CustomMenu = React.forwardRef(
    (
      {
        children,
        style,
        className,
        "aria-labelledby": labeledBy,
        correspondingPage,
      },
      ref
    ) => {
      const [value, setValue] = useState(""); 
      useEffect(() => {
        setValue(correspondingPage.pageDate);
        correspondingPage.pageDateChanged = false;
      }, []);

      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <Form.Group
            controlId="dob"
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Form.Control
              type="date"
              name="dob"
              placeholder="Date"
              style={{ width: "130px" }}
              onChange={(e) => {
                setValue(e.target.value);
                correspondingPage.pageDate = e.target.value;
                correspondingPage.pageDateChanged = true;
              }}
              value={value}
            />
          </Form.Group>

          <ul className="list-unstyled" style={{ marginBottom: "0px" }}>
            {children}
          </ul>
        </div>
      );
    }
  );

  return (
    <>
      <Table striped bordered hover style={{ width: "90%" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>
              page title
            </th>
            <th>
              views
            </th>
            <th>
              date
            </th>
          </tr>
        </thead>
        <tbody>
          {currentPages.map((page, index) => (
            <tr
              key={
                (myValues.currentPaginationPage - 1) * myValues.pagesPerSite +
                index +
                1
              }
            >
              <td>
                {(myValues.currentPaginationPage - 1) * myValues.pagesPerSite +
                  index +
                  1}
              </td>
              <td>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <a href={page.url} target="_blank" rel="noreferrer">
                    {page.title}
                  </a>

                  <span>
                    <Dropdown
                      drop={"start"}
                      id="testToggle"
                      onToggle={(e) => handleToggle(e, page)}
                    >
                      {loading ? (
                        <span
                          style={{
                            cursor: "pointer",
                            color: "lightgrey",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                          </svg>
                        </span>
                      ) : (
                        <>
                          <Dropdown.Toggle as={CustomToggle} />
                          <Dropdown.Menu
                            as={CustomMenu}
                            size="sm"
                            title=""
                            correspondingPage={page}
                          >
                            <Dropdown.Item
                              onClick={() => handlePageQrCode(page)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-qr-code-scan"
                                viewBox="0 0 16 16"
                              >
                                <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0v-3Zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5ZM.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5Zm15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5ZM4 4h1v1H4V4Z" />
                                <path d="M7 2H2v5h5V2ZM3 3h3v3H3V3Zm2 8H4v1h1v-1Z" />
                                <path d="M7 9H2v5h5V9Zm-4 1h3v3H3v-3Zm8-6h1v1h-1V4Z" />
                                <path d="M9 2h5v5H9V2Zm1 1v3h3V3h-3ZM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8H8Zm2 2H9V9h1v1Zm4 2h-1v1h-2v1h3v-2Zm-4 2v-1H8v1h2Z" />
                                <path d="M12 9h2V8h-2v1Z" />
                              </svg>{" "}
                              QR-Code
                            </Dropdown.Item>
                            <Dropdown.Item
                              style={{ color: "#dc3545" }}
                              onClick={() => handlePageDelete(page)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                              </svg>{" "}
                              delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </>
                      )}
                    </Dropdown>
                  </span>
                </div>
              </td>
              <td>{page.views}</td>
              <td>{page.pageDate}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <PagesPagination />
      <QRCodeModal />
    </>
  );
}
