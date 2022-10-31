import {
  Card, Breadcrumb, Button, Space, Typography,
} from 'antd';
import Icon, {
  SettingOutlined, StarOutlined, ContainerTwoTone, PlusCircleTwoTone, DiffTwoTone,
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import './CoursePage.css';
import React from 'react';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import GetCourse from './fetch/GetCourse';

const { Title } = Typography;

const GetCard = ({ cardIcon, title }:
  { cardIcon: React.ForwardRefExoticComponent<any>, title: string }) => (
  <Card className="card" hoverable bordered>
    <Icon className="card-icon" component={cardIcon} />
    <br />
    <br />
    <h2>{title}</h2>
  </Card>
);

const Header = ({ courseCode, courseName }:
  { courseCode: string, courseName: string }) => (
  <div>
    <Breadcrumb>
      <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
      <Breadcrumb.Item><Link to="/courses">Courses</Link></Breadcrumb.Item>
      <Breadcrumb.Item>{courseCode}</Breadcrumb.Item>
    </Breadcrumb>
    <div className="title">
      <Title level={3} ellipsis>{courseName}</Title>
      <div>
        <Space>
          <Link to={`/courses/${courseCode}/topics`}>
            <Button type="primary" icon={<SettingOutlined />} shape="round">
              Manage Topics
            </Button>
          </Link>
          <Button type="primary" icon={<StarOutlined />} shape="round" />
        </Space>
      </div>
    </div>
  </div>
);

const CoursePage = () => {
  // fetch the course here
  const params = useParams();
  const courseCode = params.id;
  const { loading, courseName, error } = GetCourse(courseCode ?? '');

  if (loading) return <Loading />;

  if (error !== '') return <ErrorMessage title={error} link="/courses" message="Go back to courses" />;

  return (
    <Card title={<Header courseCode={courseCode ?? ''} courseName={courseName ?? ''} />} bordered={false}>
      <main className="main-container">
        <div className="cards">
          <Link to={`/courses/${courseCode}/browse`}><GetCard cardIcon={ContainerTwoTone} title="Browse Questions" /></Link>
          <Link to={`/courses/${courseCode}/addQuestion`}><GetCard cardIcon={PlusCircleTwoTone} title="Add a Question" /></Link>
          <Link to={`/courses/${courseCode}/review`}><GetCard cardIcon={DiffTwoTone} title="Review Questions" /></Link>
        </div>
      </main>
    </Card>
  );
};

export default CoursePage;