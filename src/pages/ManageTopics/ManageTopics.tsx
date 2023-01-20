import { Breadcrumb, Typography, Card } from 'antd';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import GetAllTopics from './fetch/GetTopics';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import TopicsTable from './TopicsTable';

const { Text, Title } = Typography;

const Header = ({ courseId, title }:
    { courseId: string, title: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseId}`}>{courseId}</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Text>Topics</Text></Breadcrumb.Item>
        </Breadcrumb>
        <div className="title">
            <Title level={3} ellipsis>{title}</Title>
        </div>
    </div>
);

const ManageTopics = () => {
    const params = useParams();
    const { courseId } = params;

    const { topics, loading, error } = GetAllTopics(courseId ?? '');

    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link={`/courses/${courseId}`} message='Go back to course' />;

    return (
        <Card title={<Header courseId={courseId ?? ''} title={`Topics for ${courseId}`} />} bordered={false}>
            <main className="main-container">
                <TopicsTable topics={topics} courseId={courseId ?? ''} />
            </main>
        </Card>
    );
};

export default ManageTopics;