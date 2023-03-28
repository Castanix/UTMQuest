import { Card, Space, Typography } from 'antd';
import './DashboardPage.css';
import React from 'react';
import BookmarkCoursesList from './BookmarkCoursesList';

const paginationConfig = (total: number, size: number) => ({
  defaultCurrent: 1,
  total,
  pageSize: size,
  hideOnSinglePage: true
});

const DashboardPage = ({ bookmarkedCourses }: { bookmarkedCourses: [string, string][] }) => (
  <div className="dashboard-content">
    <Space direction="vertical">
      <Card title="Bookmarked Courses" className="bookmarked-courses">
        <div className="card-content">
          <BookmarkCoursesList courseData={bookmarkedCourses} paginationConfig={paginationConfig} />
        </div>
      </Card>
      <Typography.Text italic>More widgets coming soon.</Typography.Text>
    </Space>
  </div>
);

export default DashboardPage;