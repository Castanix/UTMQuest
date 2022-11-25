import {
  Card, Breadcrumb, Button, Space, Typography
} from 'antd';
import Icon, {
  SettingTwoTone, StarOutlined, StarFilled, ContainerTwoTone, PlusCircleTwoTone, ContainerFilled, PlusCircleFilled, SettingFilled,
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import './CoursePage.css';
import React, { useContext, useState } from 'react';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import GetCourse from './fetch/GetCourse';
import { CheckSaved, SaveCourse } from './fetch/SavedCourses';
import { ThemeContext } from '../../components/Topbar/Topbar';

const { Title } = Typography;

const GetCard = ({ cardIcon, title }:
  { cardIcon: React.ForwardRefExoticComponent<any>, title: string }) => (
  <Card className="card" hoverable bordered>
    <Space direction="vertical">
      <Icon className="card-icon" component={cardIcon} />
      <Title level={4}>{title}</Title>
    </Space>
  </Card>
);

const Header = ({ courseCode, courseName, favourite, setFavourite }:
  { courseCode: string, courseName: string, favourite: boolean, setFavourite: Function }) => (
  <div>
    <Breadcrumb>
      <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
      <Breadcrumb.Item>{courseCode}</Breadcrumb.Item>
    </Breadcrumb>
    <div className="course-title">
      <Title level={3} ellipsis>{courseName}</Title>
      <div>
        <Button
          type={favourite ? "primary" : "default"}
          icon={favourite ? <StarFilled /> : <StarOutlined style={{ color: "#1677FF" }} />}
          shape="round"
          onClick={() => {
            SaveCourse(courseCode, favourite, setFavourite);
          }}
        />
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

  const isLightMode = useContext(ThemeContext);

  if (loadingCourses || loadingSaved) return <Loading />;

  if (errorCourses !== '') return <ErrorMessage title={errorCourses} link="/" message="Home" />;
  if (errorSaved !== '') return <ErrorMessage title={errorSaved} link="/" message="Home" />;

  return (
    <Card title={<Header courseCode={courseCode ?? ''} courseName={courseName ?? ''} favourite={isSaved} setFavourite={setIsSaved} />} bordered={false}>
      <main className="main-container">
        <div className="cards">
          <Link to={`/courses/${courseCode}/browse`}><GetCard cardIcon={isLightMode ? ContainerTwoTone : ContainerFilled} title="Browse Questions" /></Link>
          <Link to={`/courses/${courseCode}/addQuestion`}><GetCard cardIcon={isLightMode ? PlusCircleTwoTone : PlusCircleFilled} title="Add a Question" /></Link>
          <Link to={`/courses/${courseCode}/topics`}><GetCard cardIcon={isLightMode ? SettingTwoTone : SettingFilled} title="Manage Topics" /></Link>
        </div>
      </main>
    </Card>
  );
};

export default CoursePage;