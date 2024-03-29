import { MessageOutlined, SearchOutlined, QuestionOutlined } from '@ant-design/icons';
import { Divider, Input, List, Select, Space, Tag, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { QuestionsType } from '../../../backend/types/Questions';
import TopicsType from '../../../backend/types/Topics';
import DisplayBadges from '../../components/DisplayBadges/DisplayBadges';
import GetRelativeTime from '../../RelativeTime';
import QuestionState from './fetch/QuestionState';

import "./QuestionsList.css";

const { Option } = Select;

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

const GetAuthorName = (question: QuestionsType) => {
    const { anon, authName, authId } = question;
    if (anon) {
        return <Typography.Text>{authName}</Typography.Text>;
    }

    return <Link to={`/profile/${authId}`}>{authName}</Link>;
};

export const GetUserInitials = (username: string) => {
    if (username === "") return "";

    const name = username.split(" ");
    const firstInitial = name[0][0].toUpperCase();
    const lastInitial = name[name.length - 1][0].toUpperCase();

    return firstInitial.concat(lastInitial);
};

const QuestionsList = ({ questions, topics }:
    { questions: QuestionsType[], topics: TopicsType[] }) => {
    const {
        data,
        searchTerm,
        onSearchChange,
        onSelectChange
    } = QuestionState(questions);

    const options: React.ReactNode[] = [];

    topics.forEach(item => options.push(<Option key={item._id} value={item.topicName.toLowerCase()}>{item.topicName}</Option>));

    return (
        <div>
            <Space className='questions-table-toolbar' split={<Divider className='questions-divider' type="vertical" />}>
                <Select
                    mode="multiple"
                    size="middle"
                    placeholder="Filter by topic"
                    className='question-list-select'
                    onChange={onSelectChange}
                >
                    {options}
                </Select>
                <Input placeholder="Search question" prefix={<SearchOutlined />} value={searchTerm} className='questions-search' onChange={(event) => onSearchChange(event.target.value)} />
            </Space>
            <List
                className='question-list'
                itemLayout="vertical"
                bordered
                size="small"
                pagination={{
                    hideOnSinglePage: true,
                    showSizeChanger: true,
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
                                    <div className='question-list-img'>
                                        {item.anon ?
                                            <QuestionOutlined />
                                            :
                                            <p>{GetUserInitials(item.authName)}</p>
                                        }
                                    </div>
                                }
                                title={
                                    <div>
                                        <div className="question-list-page-header">
                                            {diff < 24 ? <Tag color="#428efa">New</Tag> : null}
                                            <Link className="question-list-title" to={`/courses/${item.courseId}/question/${item.link}`}>
                                                <Typography.Text ellipsis className="question-name">{item.qnsName}</Typography.Text>
                                            </Link>
                                        </div>
                                        <div className="ant-page-header-heading-sub-title">
                                            <Typography.Paragraph>
                                                {GetAuthorName(item)}
                                                {!item.anon ? <DisplayBadges utorid={item.authId} /> : null}
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

export default QuestionsList;