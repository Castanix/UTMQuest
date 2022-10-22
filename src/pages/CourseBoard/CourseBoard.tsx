import React from "react";
import { Breadcrumb, Card, Typography } from "antd";
import { Link } from "react-router-dom";
import './CourseBoard.css';
import GetAllCourses from "./fetch/GetAllCourses";
import CourseBoardTable from "./CourseBoardTable";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";

const { Title } = Typography;

const Header = () => (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link to="/courses">Courses</Link></Breadcrumb.Item>
      </Breadcrumb>
      <Title level={3}>Courses</Title>
    </div>
);

const CourseBoard = () => {
    const { courses, loading, error } = GetAllCourses();


    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link='.' message='Refresh' />;

    return (
        <Card title={<Header />} bordered={false}>
            <main className="main-container">
                <div className="card-content-courseboard">
                    <CourseBoardTable dataSource={courses} />
                </div>
            </main>
        </Card>
    );
};

export default CourseBoard;