import { Breadcrumb, Typography, Card } from 'antd';
// import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
// import Topics from '../../../backend/types/Topics';
import GetAllTopics from './fetch/GetTopics';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import TopicsTable from './TopicsTable';

const { Title } = Typography;

// const columns: ColumnsType<Topics> = [
//     {
//         title: 'Topic Name',
//         dataIndex: 'topicName',
//     },
//     {
//         title: '# Questions',
//         dataIndex: 'numApproved',
//     },
//     {
//         title: '# Questions Pending Review',
//         dataIndex: 'numPending',
//     },
//     {
//         title: 'Action',
//         render: () => (
//             <Space size="middle">
//                 <a href='/'>Delete</a>
//             </Space>
//         ),
//     },
// ]

const Header = ({ courseCode, title }:
    { courseCode: string, title: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/courses">Courses</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseCode}`}>{courseCode}</Link></Breadcrumb.Item>
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

    if (error !== '') return <ErrorMessage title={error} link='/courses' message='Go back to courses' />

    return (
        <Card title={<Header courseCode={courseCode ?? ''} title={`Topics for ${courseCode}`} />} bordered={false}>
            {/* <Table columns={columns} dataSource={topics} rowKey="_id" /> */}
            <TopicsTable topics={topics} />
        </Card>
    )
}

export default ManageTopics;