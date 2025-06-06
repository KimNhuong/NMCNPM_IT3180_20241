import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import React, { useState, useEffect } from "react";
import help from "../../../src/components/introduce/img/help.png";
import Chat from "../../../src/pages/home/chat";
import "../LayoutDefault/index.css";
function LayoutDefault() {
  const [size, formSize] = useState(80);
  const [chat, setChat] = useState(false);
  const [ring2, setRing2] = useState(false);
  const change = () => {
    formSize((a) => {
      if (a == 80) return 96;
      else return 80;
    });
  };
  const ring = () => {
    setRing2(true);
  };
  return (
    <>
      <Header size={size} />
      <main>
        <Sidebar change={change} />
        <div
          style={{
            width: `${size}%`,
            marginLeft: `${100 - size}%`,
            marginTop: "82px",
          }}
        >
          <Outlet className="main__content" />
          <div id="wrapper">
            <Chat chats={chat} ring={ring} />

            <div
              className="image-container2"
              style={
                ring2
                  ? { animation: "tiltAnimation 1.5s infinite" }
                  : { animation: "" }
              }
            >
              <div
                className="support-btn"
                style={
                  chat
                    ? { right: "50px", bottom: "18px", cursor: "pointer" }
                    : { right: "57px", bottom: "18px", cursor: "pointer" }
                }
                onClick={() => {
                  setChat((a) => !a);
                  setRing2(false);
                }}
              >
                <span className="support-text">{chat ? "tắt chat" : "Chat"}</span>
              </div>
              <img src={help} alt="Background" className="background-image" />
            </div>
          </div>
        </div>
      </main>
      {/* <footer>Footer</footer> */}
    </>
  );
}

export default LayoutDefault;
