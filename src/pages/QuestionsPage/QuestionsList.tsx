import { MessageOutlined, SearchOutlined, QuestionOutlined, PlusCircleTwoTone, CheckCircleFilled } from '@ant-design/icons';
import { Button, Divider, Input, List, Popover, Select, Space, Tag, Typography } from 'antd';
import React, { SetStateAction, useContext } from 'react';
import { Link } from 'react-router-dom';
import { QuestionFrontEndType } from '../../../backend/types/Questions';
import DisplayBadges from '../../components/DisplayBadges/DisplayBadges';
import GetRelativeTime from '../../RelativeTime';

import "./QuestionsList.css";
import QuizGenerationMenu from '../QuizPage/QuizGenerationMenu';
import { TopicsFrontEndType } from '../../../backend/types/Topics';
import { QuestionState } from './QuestionState';
import { ThemeContext } from '../../components/Topbar/Topbar';

const { Option } = Select;

type QuestionsDataType = {
    questions: QuestionFrontEndType[],
    totalNumQns: number,
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

const QuestionsList = ({ questionsData, courseId, topics, setTopicFilters, setSearchFilter }: 
    { questionsData: QuestionsDataType, courseId: string, topics: TopicsFrontEndType[], setTopicFilters: React.Dispatch<SetStateAction<Set<string>>>, setSearchFilter: React.Dispatch<SetStateAction<string>> }) => {
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

    const { questions, totalNumQns } = questionsData;

    console.log(totalNumQns);

    const {
        searchTerm,
        currTopicFilters,
        onSearchChange,
        sessionState,
        onPaginationChange,
        onTopicFilterChange,
    } = QuestionState(courseId, setTopicFilters, setSearchFilter);

    const options: React.ReactNode[] = [];

    // let numQns = 0;
    (topics as TopicsFrontEndType[]).forEach(item => {
        const { _id, topicName } = item;

        // if (currTopicFilters.has(topicName)) numQns += count;
        options.push(<Option key={ _id } value={ topicName }>{ topicName }</Option>);
    });

    return (
        <div>
            <div className="questions-table-header">
                <Space className='questions-table-toolbar' split={<Divider className='questions-divider' type="vertical" />}>
                    <Select
                        mode="multiple"
                        size="middle"
                        placeholder="Filter by topic"
                        className='question-list-select'
                        defaultValue={ currTopicFilters ? [...currTopicFilters] : [] }
                        onChange={ onTopicFilterChange }
                    >
                        { options }
                    </Select>
                    <Input placeholder="Search question" prefix={ <SearchOutlined /> } value={ searchTerm } className='questions-search' onChange={(event) => onSearchChange(event.target.value)} />
                </Space>
                <Space>
                    <QuizGenerationMenu courseId={ courseId } topics={ topics } />
                    <Link to={ `/courses/${ courseId }/addQuestion` }><Button type="primary" shape="round" icon={ <PlusCircleTwoTone /> }>Add a Question</Button></Link>
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
                    total: totalNumQns,
                    onChange: onPaginationChange
                }}
                dataSource={ questions }
                renderItem={ item => {
                    const { _id, anon, utorName, qnsLink, qnsName, rating, userId, numDiscussions, date } = item;

                    const diff = (new Date().getTime() - new Date(item.date).getTime()) / (60 * 60 * 1000);

                    return (
                        <List.Item
                            key={_id}
                            actions={[
                                // <IconText icon={LikeOutlined} text="156" key="list-vertical-message" />,
                                // <IconText icon={DislikeOutlined} text="20" key="list-vertical-message" />,
                                <IconText icon={MessageOutlined} text={numDiscussions.toString()} key="list-vertical-message" />
                            ]}
                        >
                            <List.Item.Meta
                                className='question-list-meta'
                                avatar={
                                    <div className={`question-list-img ${ isLightMode ? 'light' : 'dark'}`}>
                                        {anon ?
                                            <QuestionOutlined />
                                            :
                                            <p>{GetUserInitials(utorName)}</p>
                                        }
                                    </div>
                                }
                                title={
                                    <div>
                                        <div className="question-list-page-header">
                                            <Space dir="vertical" size={1}>
                                                {diff < 24 ? <Tag color="#428efa">New</Tag> : null}
                                                <Link className="question-list-title" to={`/courses/${courseId}/question/${qnsLink}`}>
                                                    <Typography.Text ellipsis className="question-name">{qnsName}</Typography.Text>
                                                </Link>
                                                {GetRating(rating)
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
                                                {!anon ? <DisplayBadges userId={userId} /> : null}
                                            </Typography.Paragraph>
                                            <Typography.Text type="secondary">{GetRelativeTime(new Date(date).getTime())}</Typography.Text>
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