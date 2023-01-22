import { Breadcrumb, Button, Card, Space, Typography } from 'antd';
import Title from 'antd/es/typography/Title';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SettingTwoTone, StarFilled, StarOutlined } from '@ant-design/icons';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import GetAllTopics from '../ManageTopics/fetch/GetTopics';
import GetQuestions from './fetch/GetQuestions';
import { QuestionsList } from './QuestionsList';
import { CheckBookmark, BookmarkCourse } from './fetch/BookmarkCourse';


const { Text } = Typography;

const Header = ({ courseId, courseName, bookmarked, setBookmarked }:
    { courseId: string, courseName: string, bookmarked: boolean, setBookmarked: Function }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Text>{courseId}</Text></Breadcrumb.Item>
        </Breadcrumb>
        <div className="browse-question-title">
            <Title level={3} ellipsis>{`${courseId} - ${courseName}`}</Title>
            <div>
                <Space>
                    <Link to={`/courses/${courseId}/topics`}>
                        <Button type="primary" shape="round" icon={<SettingTwoTone />}>Manage Topics</Button>
                    </Link>
                    <Button
                        type={bookmarked ? "primary" : "default"}
                        icon={bookmarked ? <StarFilled /> : <StarOutlined style={{ color: "#1677FF" }} />}
                        shape="round"
                        onClick={() => {
                            BookmarkCourse(courseId, bookmarked, setBookmarked);
                        }}
                    />
                </Space>
            </div>
        </div>
    </div>
);

const QuestionsPage = () => {
    const params = useParams();
    const { courseId } = params;

    const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
    const { loadingBookmarked, errorBookmarked, loadingCourse, errorCourse, courseName } = CheckBookmark(courseId ?? '', setIsBookmarked);

    const { loadingTopics, topics, errorTopics } = GetAllTopics(courseId ?? '');
    const { loading, questions, error } = GetQuestions(courseId ?? '');

    if (loading || loadingTopics || loadingBookmarked || loadingCourse) return <Loading />;
    if (error instanceof Error) return <ErrorMessage title={error.message} link="." message="Refresh" />;
    if (errorTopics instanceof Error) return <ErrorMessage title={errorTopics.message} link="." message="Refresh" />;
    if (errorBookmarked instanceof Error) return <ErrorMessage title={errorBookmarked.message} link="." message="Refresh" />;
    if (errorCourse instanceof Error) return <ErrorMessage title={errorCourse.message} link="." message="Refresh" />;

    return (
        <Card title={<Header courseId={courseId ?? ''} courseName={courseName ?? ''} bookmarked={isBookmarked} setBookmarked={setIsBookmarked} />} bordered={false}>
            <main className='main-container'>
                <QuestionsList questions={questions} topics={topics} courseId={courseId ?? ""} />
            </main>
        </Card>
    );
};

export default QuestionsPage;