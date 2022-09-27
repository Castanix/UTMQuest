import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "antd/dist/antd.min.css";
import App from "./App";
import Topbar from "./components/Topbar";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CoursePage from "./pages/coursePage/coursePage";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Topbar>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/courses" element={<div>Coming soon</div>} />
          <Route path="/courses/:id" element={<CoursePage />} />
          <Route path="/profile" element={<div>Coming soon</div>} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Topbar>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
