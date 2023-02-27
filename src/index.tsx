import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { notification } from 'antd';
import { FireTwoTone } from '@ant-design/icons';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';
import Topbar from './components/Topbar/Topbar';
import reportWebVitals from './reportWebVitals';
import ManageTopics from './pages/ManageTopics/ManageTopics';
import QuestionsPage from './pages/QuestionsPage/QuestionsPage';
import AddQuestionPage from './pages/AddQuestionPage/AddQuestionPage';
import ApprovedQuestion from './pages/ApprovedQuestion/ApprovedQuestion';
import LandingPage from './pages/LandingPage/LandingPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import QuizPage from './pages/QuizPage/QuizPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const queryClient = new QueryClient();
/* Once login is implemented, we can move the following within the login callback. */

fetch(`${process.env.REACT_APP_API_URI}/incrementLoginStreak`, { method: "PUT" })
  .then((result) => {
    if (!result.ok) throw Error("Could not increment login streak");
    return result.json();
  }).then((response) => {
    notification.success({
      message: `Daily login streak: ${response.streak}`,
      placement: "bottom",
      icon: <FireTwoTone />
    });
  }).catch((error) => {
    console.log(error);
  });

root.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Topbar>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses/:courseId/topics" element={<ManageTopics />} />
          <Route path="/courses/:courseId/addQuestion" element={<AddQuestionPage />} />
          <Route path="/courses/:courseId/editQuestion" element={<AddQuestionPage />} />

          <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
          <Route path="/courses/:courseId/:page" element={<QuestionsPage />} />

          <Route path="/courses/:courseId/question/:qnsLink" element={<ApprovedQuestion />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Topbar>
      <ReactQueryDevtools />
    </QueryClientProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
