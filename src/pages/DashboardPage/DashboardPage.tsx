import {
  Breadcrumb, Card, Typography,
} from 'antd';
import { Link } from 'react-router-dom';
import './DashboardPage.css';
import React from 'react';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import GetWidgets from './fetch/GetWidgets';
import ReviewQuestionsTable from './ReviewQuestionTable';
import SavedCoursesList from './SavedCoursesList';

const { Title } = Typography;

const paginationConfig = (total: number, size: number) => ({
  defaultCurrent: 1,
  total,
  pageSize: size,
});

const Header = () => (
  <div>
    <Breadcrumb>
      <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
    </Breadcrumb>
    <Title level={3}>Dashboard</Title>
  </div>
);

const DashboardPage = () => {
  const utorid = 'dummy22';
  const { loading, courseData, reviewQnsData, error } = GetWidgets(utorid);

  if (loading) return <Loading />;

  if (error !== '') return <ErrorMessage title={error} link='.' message='Refresh' />;

  return (
      <Card title={<Header />} bordered={false}>
        <main className="main-container">
          <div className="dashboard-content">
            <Card title="Saved Courses">
              <div className="card-content">
                <SavedCoursesList courseData={courseData} paginationConfig={paginationConfig} />
              </div>
            </Card>

            <Card title="Questions Pending Review">
              <div className="card-content">
                <ReviewQuestionsTable reviewQnsData={reviewQnsData} paginationConfig={paginationConfig} />
              </div>
            </Card>
          </div>
        </main>
      </Card>
  );
};

export default DashboardPage;