import { Breadcrumb, Card } from 'antd';
import Title from 'antd/es/typography/Title';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import GetAllTopics from '../ManageTopics/fetch/GetTopics';
import GetQuestions from './fetch/GetQuestions';
import QuestionsList from './QuestionsList';

const Header = ({ courseCode, title }:
    { courseCode: string, title: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseCode}`}>{courseCode}</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Browse Questions</Breadcrumb.Item>
        </Breadcrumb>
        <Title level={3} ellipsis>{title}</Title>
    </div>
);

const QuestionsPage = () => {
    const params = useParams();
    const courseCode = params.id;

    const { loading: loadingTopics, topics, error: errorTopics } = GetAllTopics(courseCode ?? '');
    const { loading, questions, error } = GetQuestions(courseCode ?? '');

    if (loading || loadingTopics) return <Loading />;

    if (error !== '' || errorTopics !== '') return <ErrorMessage title={error !== '' ? error : errorTopics} link={`/courses/${courseCode}`} message="Go back to course" />;

    return (
        <Card title={<Header courseCode={courseCode ?? ''} title={`Browse Questions for ${courseCode}`} />} bordered={false}>
            <main className='main-container'>
                <QuestionsList questions={questions} topics={topics} />
            </main>
        </Card>
    );
};

export default QuestionsPage;