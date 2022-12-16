import { Breadcrumb, Typography, Card } from 'antd';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import GetAllTopics from './fetch/GetTopics';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import TopicsTable from './TopicsTable';

const { Title } = Typography;

const Header = ({ courseCode, title }:
    { courseCode: string, title: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><u>Dashboard</u></Link></Breadcrumb.Item>
            <Breadcrumb.Item>{courseCode}</Breadcrumb.Item>
            <Breadcrumb.Item>Topics</Breadcrumb.Item>
        </Breadcrumb>
        <div className="title">
            <Title level={3} ellipsis>{title}</Title>
        </div>
    </div>
);

const ManageTopics = () => {

    const params = useParams();
    const courseCode = params.id;

    const { topics, loading, error } = GetAllTopics(courseCode ?? '');

    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link={`/courses/${courseCode}`} message='Go back to course' />;

    return (
        <Card title={<Header courseCode={courseCode ?? ''} title={`Topics for ${courseCode}`} />} bordered={false}>
            <main className="main-container">
                <TopicsTable topics={topics} courseId={courseCode ?? ''} />
            </main>
        </Card>
    );
};

export default ManageTopics;