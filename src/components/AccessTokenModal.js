import React, { useState, useContext, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { MyContext } from "./MyContext";
import QRCode from "qrcode";

export default function AccessTokenModal({ backdrop, redirectPage }) {
  const [myValues, setMyValues] = useContext(MyContext);
  const [accessTokenQrCode, setAccessTokenQrCode] = useState();

  const handleClose = () =>
    setMyValues((oldValues) => ({
      ...oldValues,
      showAccessTokenModal: false,
      currentPage:
        redirectPage === undefined ? myValues.currentPage : redirectPage,
    }));

  useEffect(() => {
    QRCode.toDataURL(
      "https://github.com/onlywannadance" +
        myValues.currentAccessToken
    )
      .then((qrCode) => {
        setAccessTokenQrCode(qrCode);
      })
      .catch((err) => {
        console.error(err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>

      <Modal
        show={myValues.showAccessTokenModal}
        onHide={handleClose}
        size="sm"
        backdrop={backdrop}
      >
        <Modal.Body>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div>Access Token for {myValues.currentShortName}</div>
            <img src={accessTokenQrCode} alt="qrCode" />
            <div style={{ wordBreak: "break-all", textAlign: "center" }}>
              {myValues.currentAccessToken}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: "center" }}>
          <Button variant="outline-secondary" onClick={handleClose}>
            close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
