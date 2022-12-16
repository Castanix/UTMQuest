import { Breadcrumb, Button, Card, Divider, Space, Typography } from "antd";
import React, { useState } from "react";
import CourseBoard from "../../components/CourseBoard/CourseBoard";
import DashboardPage from "../../components/DashboardPage/DashboardPage";

import "./LandingPage.css";

const { Title } = Typography;

const Header = () => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        <Title level={3}>Home</Title>
    </div>
);

const LandingPage = () => {
    const [viewAllCourses, setViewAllCourses] = useState<boolean>(false);

    return (
        <Card title={<Header />} bordered={false}>
            <main className="main-container">
                <Title level={3}>Pick the course you want to practice</Title>
                <Space className="landing-page-toolbar">
                    <Button shape="round" type={viewAllCourses ? `default` : `primary`} onClick={() => setViewAllCourses(false)}>Select from bookmarked courses</Button>
                    <Button shape="round" type={viewAllCourses ? `primary` : `default`} onClick={() => setViewAllCourses(true)}>Select from all courses</Button>
                </Space>
                <Divider />
                {viewAllCourses ? <CourseBoard /> : <DashboardPage />}
            </main>
        </Card>
    );
};

export default LandingPage;