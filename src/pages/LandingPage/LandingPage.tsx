import { Breadcrumb, Button, Card, Divider, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import CourseBoard from "../../components/CourseBoard/CourseBoard";
import DashboardPage from "../../components/DashboardPage/DashboardPage";
import GetWidgets from "../../components/DashboardPage/fetch/GetWidgets";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";

import "./LandingPage.css";

const { Text, Title } = Typography;

const Header = () => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Text>Dashboard</Text></Breadcrumb.Item>
        </Breadcrumb>
        <Title level={3}>Home</Title>
    </div>
);

const LandingPage = () => {
    const { loading, bookmarkedCourses, error } = GetWidgets();

    const [viewAllCourses, setViewAllCourses] = useState<boolean>(true);

    useEffect(() => {
        if (!loading) setViewAllCourses(bookmarkedCourses?.length === 0);

    }, [loading, bookmarkedCourses.length]);

    if (loading) return <Loading />;

    if (error instanceof Error) return <ErrorMessage title={error.message} link='.' message='Refresh' />;

    return (
        <Card title={<Header />} bordered={false}>
            <main className="main-container">
                <Title level={3}>Pick the course you want to practice</Title>
                <Space className="landing-page-toolbar">
                    <Button shape="round" type={viewAllCourses ? `default` : `primary`} onClick={() => setViewAllCourses(false)}>Select from bookmarked courses</Button>
                    <Button shape="round" type={viewAllCourses ? `primary` : `default`} onClick={() => setViewAllCourses(true)}>Select from all courses</Button>
                </Space>
                <Divider />
                {viewAllCourses ? <CourseBoard /> : <DashboardPage bookmarkedCourses={bookmarkedCourses} />}
            </main>
        </Card>
    );
};

export default LandingPage;