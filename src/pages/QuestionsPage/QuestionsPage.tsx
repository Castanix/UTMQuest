import { Breadcrumb, Button, Card, Space, Typography } from 'antd';
import { QueryClient, useQueryClient } from 'react-query';
import Title from 'antd/es/typography/Title';
import React, { SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SettingTwoTone, StarFilled, StarOutlined } from '@ant-design/icons';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import { QuestionsList } from './QuestionsList';
import { CheckBookmark, BookmarkCourse } from './fetch/BookmarkCourse';
import GetAllTopics from '../ManageTopics/fetch/GetTopics';
import { GetStateFromSessionStorage } from './QuestionState';
import GetQuestions from './fetch/GetQuestions';
import { ThemeContext } from '../../components/Topbar/Topbar';



const { Text } = Typography;


export type TopicFilterContextType = {
    setTopicFilters: React.Dispatch<SetStateAction<Set<string>>>
}

export const TopicFiltersContext = createContext<TopicFilterContextType | null>(null);


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

    const initTopicFilter: Set<string> = new Set(GetStateFromSessionStorage(courseId).topicFilters);
    const initSearchFilter: string = GetStateFromSessionStorage(courseId).searchFilter;

    const [ topicFilters, setTopicFilters ] = useState<Set<string>>(initTopicFilter);
    const [ searchFilter, setSearchFilter ] = useState<string>(initSearchFilter);

    const { loadingTopics, topics, errorTopics } = GetAllTopics(courseId);

    const { loadingQuestions, questionsData, errorQuestions, refetch } = GetQuestions(courseId, page, searchFilter, topicFilters);

    const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
    const { loadingBookmarked, errorBookmarked, loadingCourse, errorCourse, courseName } = CheckBookmark(courseId, setIsBookmarked);

    const isLightMode = useContext(ThemeContext);

    useEffect(() => {
        refetch();
    }, [refetch, topicFilters, searchFilter]);
    
    if (loadingTopics || loadingBookmarked || loadingCourse) return <Loading />;
    if (errorTopics instanceof Error) return <ErrorMessage title={errorTopics.message} link="." message="Refresh" />;
    if (errorBookmarked instanceof Error) return <ErrorMessage title={errorBookmarked.message} link="." message="Refresh" />;
    if (errorCourse instanceof Error) return <ErrorMessage title={errorCourse.message} link="." message="Refresh" />;

    return (
        <Card title={<Header courseId={courseId} courseName={courseName} bookmarked={isBookmarked} setBookmarked={setIsBookmarked} client={queryClient} />} bordered={false}>
            {
                loadingQuestions 
                    ? <Loading />
                    : (errorQuestions instanceof Error)
                        ? <ErrorMessage title={errorQuestions.message} link="." message="Refresh" />
                        : <main className='main-container'>
                            <QuestionsList questionsData={questionsData} courseId={courseId} topics={topics} setTopicFilters={setTopicFilters} setSearchFilter={setSearchFilter} lightMode={isLightMode}/>
                        </main>
            }
        </Card>
    );
};

export default QuestionsPage;