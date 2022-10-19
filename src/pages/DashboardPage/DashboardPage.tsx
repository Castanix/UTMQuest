import {
  Breadcrumb, Card, List, Table, Typography,
} from 'antd';
import { DropboxOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './DashboardPage.css';
import React from 'react';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import GetWidgets from './fetch/GetWidgets';

const { Title } = Typography;
const { Column } = Table;

const Header = () => (
  <div>
    <Breadcrumb>
      <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
    </Breadcrumb>
    <Title level={3}>Dashboard</Title>
  </div>
);

const paginationConfig = (total: number, size: number) => ({
  defaultCurrent: 1,
  total,
  pageSize: size,
});

const ReviewQuestions = (props: any) => {
  const { reviewQnsData } = props;

  return reviewQnsData.length
    ? (
      <Table
        dataSource={reviewQnsData}
        pagination={paginationConfig(reviewQnsData.length, 4)}
      >
        <Column title="Question Name" dataIndex="qnsName" key="qnsName" />
        <Column title="Topic" dataIndex="topic" key="topic" />
        <Column title="Course Code" dataIndex="courseCode" key="courseCode" />
        <Column title="Review Status" dataIndex="reviewStatus" key="reviewStatus" />
      </Table>
    ) : <div className="icon"><DropboxOutlined /></div>;
};

const SavedCourses = (props: any) => {
  const { courseData } = props;

  return courseData.length
    ? (
      <List
        size="small"
        bordered={false}
        dataSource={courseData}
        pagination={paginationConfig(courseData.length, 4)}
        renderItem={(item: any) => (
          <List.Item>
            <Link to={item[0]}>
              {item[1]}
            </Link>
          </List.Item>
        )}
      />
    ) : <div className="icon"><DropboxOutlined /></div>;
};

const DashboardPage = () => {
  const utorid = 'dummy22';
  const { loading, courseData, reviewQnsData, error } = GetWidgets(utorid);

  if (loading) return <Loading />;

  if (error !== '') return <ErrorMessage title={error} link='.' message='Refresh' />

  return (
    <Card title={<Header />} bordered={false}>
      <div className="dashboard-content">

        <Card title="Saved Courses">
          <div className="card-content">
            <SavedCourses courseData={courseData} />
          </div>
        </Card>

        <Card title="Questions Pending Review">
          <div className="card-content">
            <ReviewQuestions reviewQnsData={reviewQnsData} />
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default DashboardPage;