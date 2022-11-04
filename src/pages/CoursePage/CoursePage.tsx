import {
  Card, Breadcrumb, Button, Space, Typography
} from 'antd';
import Icon, {
  SettingOutlined, StarOutlined, StarFilled, ContainerTwoTone, PlusCircleTwoTone, DiffTwoTone,
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import './CoursePage.css';
import React, { useState } from 'react';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import GetCourse from './fetch/GetCourse';
import { CheckSaved, SaveCourse } from './fetch/SavedCourses';

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

const Header = ({ courseCode, courseName, favourite, setFavourite }:
  { courseCode: string, courseName: string, favourite: boolean, setFavourite: Function }) => (
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
          <Button 
            type="primary" 
            icon={favourite ? <StarFilled /> : <StarOutlined />} 
            shape="round" 
            onClick={() => {
              SaveCourse(courseCode, favourite, setFavourite);
            }}
          />
        </Space>
      </div>
    </div>
  </div>
);

const CoursePage = () => {
  // fetch the course here
  const params = useParams();
  const courseCode = params.id;
  const { loadingCourses, courseName, errorCourses } = GetCourse(courseCode ?? '');
  
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const { loadingSaved, errorSaved } = CheckSaved(courseCode ?? '', setIsSaved);

  if (loadingCourses || loadingSaved) return <Loading />;

  if (errorCourses !== '') return <ErrorMessage title={errorCourses} link="/courses" message="Go back to courses" />;
  if (errorSaved !== '') return <ErrorMessage title={errorSaved} link="/courses" message="Go back to courses" />;

  return (
    <Card title={<Header courseCode={courseCode ?? ''} courseName={courseName ?? ''} favourite={isSaved} setFavourite={setIsSaved} />} bordered={false}>
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