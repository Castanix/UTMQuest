import { DislikeOutlined, LikeOutlined, CheckOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons';
import { Divider, Input, List, PageHeader, Select, Space } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import QuestionsType from '../../../backend/types/Questions';
import TopicsType from '../../../backend/types/Topics';
import QuestionState from './fetch/QuestionState';

import "./QuestionsList.css";

const { Option } = Select;

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

const QuestionsList = ({ questions, topics, approved }: 
    { questions: QuestionsType[], topics: TopicsType[], approved: boolean }) => {
    const {
        data,
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
                <Input placeholder="Search question" prefix={<SearchOutlined />} className='questions-search' onChange={(event) => onSearchChange(event.target.value)} />
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

                    return (
                        <List.Item
                            key={item.qnsId}
                            actions={[
                                ... approved ? 
                                    [<IconText icon={LikeOutlined} text="156" key="list-vertical-message" />,
                                     <IconText icon={DislikeOutlined} text="20" key="list-vertical-message" />] :
                                    [<IconText icon={CheckOutlined} text={item.reviewStatus.toString().concat("/20")} key="list-vertical-message" />],
                                    
                                <IconText icon={MessageOutlined} text={item.numDiscussions.toString()} key="list-vertical-message" />
                            ]}
                        >
                            <List.Item.Meta
                                className='question-list-meta'
                                avatar={
                                    <div className='question-list-img'>
                                        <p>{firstInitial.concat(".").concat(lastInitial).concat(".")}</p>
                                    </div>
                                }
                                title={
                                    <PageHeader
                                        className="question-list-page-header"
                                        title={
                                            <Link className="question-list-title" to={`/courses/${item.course}/question/${item.qnsId}`}>
                                                {item.qnsName}
                                            </Link>}
                                    >
                                        <div className="ant-page-header-heading-sub-title">
                                            by {item.authName}
                                            <br />
                                            {item.date}
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