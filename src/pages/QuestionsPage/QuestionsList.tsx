import { MessageOutlined, SearchOutlined, QuestionOutlined, PlusCircleTwoTone, CheckCircleFilled } from '@ant-design/icons';
import { Button, Divider, Input, List, Popover, Select, Space, Tag, Typography } from 'antd';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { QuestionFrontEndType } from '../../../backend/types/Questions';
import { TopicsFrontEndType } from '../../../backend/types/Topics';
import DisplayBadges from '../../components/DisplayBadges/DisplayBadges';
import { ThemeContext } from '../../components/Topbar/Topbar';
import GetRelativeTime from '../../RelativeTime';

import "./QuestionsList.css";
import { QuestionState } from './QuestionState';
import QuizGenerationMenu from '../QuizPage/QuizGenerationMenu';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

const { Option } = Select;

type QueryType = {
    loading: boolean;
    fetchData: any;
    error: unknown;
};

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

const GetAuthorName = (question: QuestionFrontEndType) => {
    const { anon, utorName, userId } = question;
    if (anon) {
        return <Typography.Text>{utorName}</Typography.Text>;
    }

    return <Link to={`/profile/${userId}`}>{utorName}</Link>;
};

const GetUserInitials = (username: string) => {
    if (username === "") return "";

    if (username) {
        const name = username.split(" ");
        const firstInitial = name[0][0].toUpperCase();
        const lastInitial = name[name.length - 1][0].toUpperCase();

        return firstInitial.concat(lastInitial);
    }

    return "";
};

const GetRating = (rating: Object) => {
    const total = Object.keys(rating).length;

    if (total > 0) {
        const likes = Object.values(rating).reduce((a, b) => (a as number) + (b as number)) as number;

        return (total > 20 && likes / (total * 1.0) > 0.9);
    }

    return false;
};

const QuestionsList = ({ queryStatus, topics, courseId }:
    { queryStatus: QueryType, topics: TopicsFrontEndType[], courseId: string }) => {

    const { loading, fetchData, error } = queryStatus;


    // Note: may not be needed if pagination is limited to 10 per page
    // useEffect(() => {

    //     setTimeout(() => window.scrollTo(0, sessionState.scrollY), 100);

    //     window.addEventListener("scroll", onScroll);

    //     return () => {
    //         window.removeEventListener('scroll', onScroll);
    //     };
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    const isLightMode = useContext(ThemeContext);

    if (loading) return <Loading />;
    if (error instanceof Error) return <ErrorMessage title={error.message} link="." message="Refresh" />;

    const {
        data,
        searchTerm,
        topicFilters,
        onSearchChange,
        sessionState,
        onPaginationChange,
        onTopicFilterChange,
        // onScroll
    } = QuestionState(fetchData.questions, courseId);

    const options: React.ReactNode[] = [];

    topics.forEach(item => options.push(<Option key={item._id} value={item.topicName.toLowerCase()}>{item.topicName}</Option>));

    return (
        <div>
            <div className="questions-table-header">
                <Space className='questions-table-toolbar' split={<Divider className='questions-divider' type="vertical" />}>
                    <Select
                        mode="multiple"
                        size="middle"
                        placeholder="Filter by topic"
                        className='question-list-select'
                        defaultValue={[...topicFilters]}
                        onChange={onTopicFilterChange}
                    >
                        {options}
                    </Select>
                    <Input placeholder="Search question" prefix={<SearchOutlined />} value={searchTerm} className='questions-search' onChange={(event) => onSearchChange(event.target.value)} />
                </Space>
                <Space>
                    <QuizGenerationMenu courseId={courseId} topics={topics} />
                    <Link to={`/courses/${courseId}/addQuestion`}><Button type="primary" shape="round" icon={<PlusCircleTwoTone />}>Add a Question</Button></Link>
                </Space>

            </div>
            <List
                className='question-list'
                itemLayout="vertical"
                bordered
                size="small"
                pagination={{
                    showSizeChanger: false,
                    current: sessionState.currentPage,
                    pageSize: sessionState.pageSize,
                    total: fetchData.totalNumQns ?? data.length,
                    onChange: onPaginationChange
                }}
                dataSource={data}
                renderItem={item => {
                    const diff = (new Date().getTime() - new Date(item.date).getTime()) / (60 * 60 * 1000);

                    return (
                        <List.Item
                            key={item._id}
                            actions={[
                                // <IconText icon={LikeOutlined} text="156" key="list-vertical-message" />,
                                // <IconText icon={DislikeOutlined} text="20" key="list-vertical-message" />,
                                <IconText icon={MessageOutlined} text={item.numDiscussions.toString()} key="list-vertical-message" />
                            ]}
                        >
                            <List.Item.Meta
                                className='question-list-meta'
                                avatar={
                                    <div className={`question-list-img ${isLightMode ? 'light' : 'dark'}`}>
                                        {item.anon ?
                                            <QuestionOutlined />
                                            :
                                            <p>{GetUserInitials(item.utorName)}</p>
                                        }
                                    </div>
                                }
                                title={
                                    <div>
                                        <div className="question-list-page-header">
                                            <Space dir="vertical" size={1}>
                                                {diff < 24 ? <Tag color="#428efa">New</Tag> : null}
                                                <Link className="question-list-title" to={`/courses/${item.courseId}/question/${item.qnsLink}`}>
                                                    <Typography.Text ellipsis className="question-name">{item.qnsName}</Typography.Text>
                                                </Link>
                                                {GetRating(item.rating)
                                                    ?
                                                    <Popover content="Good Question">
                                                        <CheckCircleFilled style={{ color: "#d7ba41", marginInline: "0.25rem", fontSize: "1rem", verticalAlign: -4 }} />
                                                    </Popover>
                                                    : null
                                                }
                                            </Space>
                                        </div>
                                        <div className="ant-page-header-heading-sub-title">
                                            <Typography.Paragraph>
                                                {GetAuthorName(item)}
                                                {!item.anon ? <DisplayBadges userId={item.userId} /> : null}
                                            </Typography.Paragraph>
                                            <Typography.Text type="secondary">{GetRelativeTime(new Date(item.date).getTime())}</Typography.Text>
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    );
                }}
            />
        </div>
    );
};

export {
    QuestionsList,
    GetUserInitials
};