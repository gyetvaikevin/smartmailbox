import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./amplify.ts";

// 🔔 Service Worker regisztráció (PUSH értesítésekhez kötelező)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("Service worker regisztrálva");
      })
      .catch((err) => {
        console.error("Service worker regisztrációs hiba:", err);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);