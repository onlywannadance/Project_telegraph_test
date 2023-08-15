/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useContext, useRef } from "react";
import { MyContext } from "./MyContext";

export default function ShowPages() {
  const [myValues, setMyValues] = useContext(MyContext);
  const initialLoad = useRef(true);
  // Отображение таблички
  useEffect(() => {
    if (!initialLoad.current) {
      filterPages(myValues.pageFilter);
    }
  }, [filterPages, myValues.allPages, myValues.pageFilter, myValues.showDeletedPages]);

  useEffect(() => {
    initialLoad.current = false;
  }, []);

  function filterPages(filterString) {
    console.log("filterPages()");
    let filteredPages = myValues.allPages.filter((page) => {
      if (myValues.showDeletedPages) {
        if (page.title.toLowerCase().includes(filterString)) {
          return page;
        }
      } else {
        if (!page.deleted && page.title.toLowerCase().includes(filterString)) {
          return page;
        }
      }
    });
    setMyValues((oldValues) => ({
      ...oldValues,
      pageFilter: filterString,
      filteredPages: filteredPages,
      currentPageCount: filteredPages.length,
      currentPaginationPage: 1,
    }));
  }

}
