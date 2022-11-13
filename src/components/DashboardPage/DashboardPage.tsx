import { Card, Space, Typography } from 'antd';
import './DashboardPage.css';
import React from 'react';
import Loading from '../Loading/Loading';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import GetWidgets from './fetch/GetWidgets';
import SavedCoursesList from './SavedCoursesList';

const paginationConfig = (total: number, size: number) => ({
  defaultCurrent: 1,
  total,
  pageSize: size,
});

const DashboardPage = () => {
  const utorid = 'dummy22';
  const { loading, courseData, error } = GetWidgets(utorid);

  if (loading) return <Loading />;

  if (error !== '') return <ErrorMessage title={error} link='.' message='Refresh' />;

  return (
    <div className="dashboard-content">
      <Space direction="vertical">
        <Card title="Saved Courses" className="saved-courses">
          <div className="card-content">
            <SavedCoursesList courseData={courseData} paginationConfig={paginationConfig} />
          </div>
        </Card>
        <Typography.Text italic>More widgets coming soon.</Typography.Text>
      </Space>
    </div>
  );
};

export default DashboardPage;