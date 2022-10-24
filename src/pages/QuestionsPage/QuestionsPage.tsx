import { Breadcrumb, Card } from 'antd';
import Title from 'antd/lib/typography/Title';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import GetAllTopics from '../ManageTopics/fetch/GetTopics';
import GetQuestions from './fetch/GetQuestions';
import QuestionsList from './QuestionsList';

const Header = ({ courseCode, title, approved }:
    { courseCode: string, title: string, approved: boolean }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/courses">Courses</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseCode}`}>{courseCode}</Link></Breadcrumb.Item>
            { approved ? 
                <Breadcrumb.Item>Browse Questions</Breadcrumb.Item> :
                <Breadcrumb.Item>Review Questions</Breadcrumb.Item> }
        </Breadcrumb>
        <Title level={3} ellipsis>{title}</Title>
    </div>
);

const QuestionsPage = ({ approved }: { approved: boolean }) => {
    const params = useParams();
    const courseCode = params.id;

    const { loading: loadingTopics, topics, error: errorTopics } = GetAllTopics(courseCode ?? '');
    const { loading, questions, error } = GetQuestions(courseCode ?? '', approved);

    if (loading || loadingTopics) return <Loading />;

    if (error !== '' || errorTopics !== '') return <ErrorMessage title={error !== '' ? error : errorTopics} link="/courses" message="Go back to courses" />;

    return (
        <Card title={<Header courseCode={courseCode ?? ''} title={`${approved ? "Browse" : "Review"} Questions for ${courseCode}`} approved={approved} />} bordered={false}>
            <main className='main-container'>
                <QuestionsList questions={questions} topics={topics} approved={approved} />
            </main>
        </Card>
    );
};

export default QuestionsPage;