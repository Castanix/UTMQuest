import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'antd/dist/antd.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar/Topbar';
import reportWebVitals from './reportWebVitals';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import CoursePage from './pages/CoursePage/CoursePage';
import ManageTopics from './pages/ManageTopics/ManageTopics';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <BrowserRouter>
    <Topbar>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/courses" element={<div>Coming soon</div>} />
        <Route path="/courses/:id" element={<CoursePage />} />
        <Route path="/profile" element={<div>Coming soon</div>} />
        <Route path='/courses/:id/topics' element={<ManageTopics />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Topbar>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
