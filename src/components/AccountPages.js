/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Button,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import { MyContext } from "./MyContext";
import axios from "axios";
import PagesTable from "./PagesTable";
import AddPageModal from "./AddPageModal";
import ShowPages from "./ShowPages";

export default function AccountPages() {
  const [myValues, setMyValues] = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [fetchedPages, setFetchedPages] = useState(0);

  const initialLoad = useRef(true);

  const [pageLoadingProgress, setPageLoadingProgress] = useState(0);

  let tempAllPageArray = [];
  let tempDeletedPages = 0;

  async function getAccountPages(tempPaginationPage) {
    console.log("getAccountPages() from API");
    setLoading(true);
    const telegraphAccountPages =
      "https://api.telegra.ph/getPageList?access_token=";

    const limit = 200;

    let offset = tempPaginationPage * limit - limit;

    const apiCallGetAccountPages =
      telegraphAccountPages +
      myValues.currentAccessToken +
      "&offset=" +
      offset +
      "&limit=" +
      limit;

    axios
      .post(apiCallGetAccountPages)
      .then(function (response) {
        if (response.data.ok) {
          setMyValues((oldValues) => ({
            ...oldValues,
            currentPageCount: response.data.result.total_count,
          }));
          fillPageArray(response.data.result.pages, tempPaginationPage);
        } else {
          console.log(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function fillPageArray(telegraphPages, tempPaginationPage) {
    let tempPageArray = [];
    telegraphPages.forEach((element) => {
      let newPageObject = {
        path: element.path,
        title: element.title,
        url: element.url,
        views: element.views,
        pageDate: getPostDate(element),
        deleted: false,
      };

      if (element.title !== "...") {
        newPageObject.deleted = false;
      } else {
        newPageObject.deleted = true;
        tempDeletedPages++;
      }
      tempPageArray.push(newPageObject);
    });

    tempAllPageArray.push(...tempPageArray);
    const fetchedPages = tempAllPageArray.length;
    setFetchedPages(fetchedPages);
    const percent =
      Math.floor(((fetchedPages * 100) / myValues.currentPageCount) * 100) /
      100;
    setPageLoadingProgress(percent);
    if (
      tempAllPageArray.length + tempDeletedPages <
      myValues.currentPageCount
    ) {
      setTimeout(() => {
        getAccountPages(tempPaginationPage + 1);
      }, 100);
    } else {
      setLoading(false);
      setMyValues((oldValues) => ({
        ...oldValues,
        allPages: tempAllPageArray,
        currentDeletedPages: tempDeletedPages,
      }));
    }
  }

  function getPostDate(element) {
    let tempDate = "";
    let customDate = element.description.match(/\[date=([0-9-]+)/);
    if (customDate !== null && customDate[1] !== undefined) {
      tempDate = customDate[1];
    } else {
      let tempInfo = element.url.match(/-(\d+)(-(\d+)$|-(\d+)-\d+$)/);

      tempDate += tempInfo[1] + "-";
      if (tempInfo[3] === undefined) {
        tempDate += tempInfo[4];
      } else {
        tempDate += tempInfo[3];
      }
      tempDate = "2023-" + tempDate;
    }
    return tempDate;
  }

  function handleCreateNewPage() {
    setMyValues((oldValues) => ({
      ...oldValues,
      showAddPageModal: true,
    }));
  }

  function handleRefreshPages() {
    tempAllPageArray = [];
    tempDeletedPages = 0;
    getAccountPages(1);
  }

  useEffect(() => {
    if (!myValues.showDeletePageModal && !initialLoad.current) {
      getAccountPages(1);
    }
  }, [myValues.showDeletePageModal]);

  useEffect(() => {
    if (!myValues.showAddPageModal && !initialLoad.current) {
      getAccountPages(1);
    }
  }, [myValues.showAddPageModal]);

  useEffect(() => {
    initialLoad.current = false;
    getAccountPages(1);
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "5px",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <Button
          key="refreshPage"
          onClick={handleRefreshPages}
          variant="outline-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-arrow-clockwise"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
            />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
          </svg>
        </Button>
        <Button
          key="newPage"
          onClick={handleCreateNewPage}
          variant="outline-secondary"
        >
          + page
        </Button>

        <ShowPages />
      </div>
      {loading ? (
        <>
          <Spinner animation="grow" style={{ marginTop: "10px" }} />
          <ProgressBar
            animated
            now={pageLoadingProgress}
            style={{ minWidth: "250px", marginTop: "10px" }}
          />
          <span>
            {pageLoadingProgress} % ( {fetchedPages} pages ){" "}
          </span>
        </>
      ) : (
        <>
          <p style={{ marginTop: "20px" }}>
            page count: {myValues.currentPageCount}
          </p>
          <AddPageModal />
          <PagesTable />
        </>
      )}
    </>
  );
}
