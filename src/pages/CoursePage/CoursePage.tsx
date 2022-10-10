import {
  Card, Breadcrumb, Button, Space, Typography, Result,
} from 'antd';
import Icon, {
  SettingOutlined, StarOutlined, ContainerTwoTone, PlusCircleTwoTone, DiffTwoTone,
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import './CoursePage.css';
import React, { useState } from 'react';
import Loading from '../../components/Loading/Loading';

const { Title } = Typography;

const GetCard = ({ cardIcon, title }:
  { cardIcon: React.ForwardRefExoticComponent<any>, title: string }) => (
    <Card className="card" hoverable bordered={false}>
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
            <Button type="primary" icon={<SettingOutlined />}>Manage Topics</Button>
            <Button type="primary" icon={<StarOutlined />} />
          </Space>
        </div>
      </div>
    </div>
);

const CoursePage = () => {
  // fetch the course here
  const params = useParams();
  const courseCode = params.id;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');

  fetch(`/course/getCourse/${courseCode}`)
    .then((res: Response) => {
      if (!res.ok) throw Error(res.statusText);
      return res.json();
    }).then((result) => {
      setCourseName(result.courseName);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });

  if (loading) return <Loading />;

  if (error !== '') {
    return (
      <Card bordered={false} className="error">
        <Result
          title={error}
          extra={
            <Link to="/courses"><Button type="primary">Go back to courses</Button></Link>
}
        />
      </Card>
    );
  }

  return (
    <Card title={<Header courseCode={courseCode ?? ''} courseName={courseName ?? ''} />} bordered={false}>
      <div className="cards">
        <GetCard cardIcon={ContainerTwoTone} title="Browse Questions" />
        <GetCard cardIcon={PlusCircleTwoTone} title="Add a Question" />
        <GetCard cardIcon={DiffTwoTone} title="Review Questions" />
      </div>
    </Card>
  );
};

export default CoursePage;
