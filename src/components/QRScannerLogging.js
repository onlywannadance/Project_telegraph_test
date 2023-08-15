import React, { useContext, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import QrScanner from "qr-scanner";

export default function QRScannerLogging() {
  const [, setMyValues] = useContext(MyContext);
  const myContainer = useRef(null);

  useEffect(() => {
    const scanner = new QrScanner(
      myContainer.current,
      (result) => {
        const access_token = result.data.replace(
          "https://github.com/onlywannadance",
          ""
        );
        setMyValues((oldValues) => ({
          ...oldValues,
          currentAccessToken: access_token,
        }));
        scanner.stop();
      },
      { returnDetailedScanResult: true, highlightScanRegion: true }
    );
    setMyValues((oldValues) => ({
      ...oldValues,
      qrCodeScanner: scanner,
    }));
  }, [setMyValues]);

  return (
    <>

        <div
          ref={myContainer}
          style={{
            maxWidth: "100%",
          }}
        ></div>

    </>
  );
}
