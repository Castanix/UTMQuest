import { Breadcrumb, Button, Card, Space, Typography } from 'antd';
import { QueryClient, useQueryClient } from 'react-query';
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

const Header = ({ courseId, courseName, bookmarked, setBookmarked, client }:
    { courseId: string, courseName: string, bookmarked: boolean, setBookmarked: Function, client: QueryClient }) => (
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
                            BookmarkCourse(courseId, bookmarked, setBookmarked, client);
                        }}
                    />
                </Space>
            </div>
        </div>
    </div>
);

const QuestionsPage = () => {
    const params = useParams();
    const courseId = params.courseId ?? "";
    const page = params.page ?? "";
    const queryClient = useQueryClient();

    const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
    const { loadingBookmarked, errorBookmarked, loadingCourse, errorCourse, courseName } = CheckBookmark(courseId, setIsBookmarked);

    const { loadingTopics, topics, errorTopics } = GetAllTopics(courseId);
    const queryStatus = GetQuestions(courseId, page);

    if (loadingTopics || loadingBookmarked || loadingCourse) return <Loading />;
    if (errorTopics instanceof Error) return <ErrorMessage title={errorTopics.message} link="." message="Refresh" />;
    if (errorBookmarked instanceof Error) return <ErrorMessage title={errorBookmarked.message} link="." message="Refresh" />;
    if (errorCourse instanceof Error) return <ErrorMessage title={errorCourse.message} link="." message="Refresh" />;

    return (
        <Card title={<Header courseId={courseId} courseName={courseName} bookmarked={isBookmarked} setBookmarked={setIsBookmarked} client={queryClient} />} bordered={false}>
            <main className='main-container'>
                <QuestionsList queryStatus={queryStatus} topics={topics} courseId={courseId} />
            </main>
        </Card>
    );
};

export default QuestionsPage;