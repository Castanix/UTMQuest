import { DislikeOutlined, LikeOutlined, MessageOutlined, SearchOutlined, QuestionOutlined } from '@ant-design/icons';
import { Divider, Input, List, PageHeader, Select, Space, Tag, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { QuestionsType } from '../../../backend/types/Questions';
import TopicsType from '../../../backend/types/Topics';
import DisplayBadges from '../../components/DisplayBadges/DisplayBadges';
import QuestionState from './fetch/QuestionState';

import "./QuestionsList.css";

const { Option } = Select;

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

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
                size="small"
                pagination={{
                    pageSize: 10,
                }}
                dataSource={data}
                renderItem={item => {
                    const name = item.authName.split(" ");
                    const firstInitial = name[0][0];
                    const lastInitial = name[name.length - 1][0];
                    const diff = (new Date().getTime() - new Date(item.date).getTime()) / (60 * 60 * 1000);

                    return (
                        <List.Item
                            key={item._id}
                            actions={[
                                <IconText icon={LikeOutlined} text="156" key="list-vertical-message" />,
                                <IconText icon={DislikeOutlined} text="20" key="list-vertical-message" />,

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
                                            <p>{firstInitial.concat(lastInitial)}</p>
                                        }
                                    </div>
                                }
                                title={
                                    <PageHeader
                                        className="question-list-page-header"
                                        title={
                                            <>
                                                {diff < 24 ? <Tag color="#428efa">New</Tag> : null}
                                                <Link className="question-list-title" to={`/courses/${item.courseId}/question/${item.link}`}>
                                                    <span className="question-name">{item.qnsName}</span>
                                                </Link>
                                            </>
                                        }
                                    >
                                        <div className="ant-page-header-heading-sub-title">
                                            <Typography.Paragraph>{item.authName} {!item.anon ? <DisplayBadges utorid={item.authId} /> : null}</Typography.Paragraph>
                                            <Typography.Text type="secondary">{new Date(item.date).toDateString()}</Typography.Text>
                                        </div>
                                    </PageHeader>
                                }
                            />
                            {/* {item.content} */}
                        </List.Item>
                    );
                }}
            />
        </div>
    );
};

export default QuestionsList;