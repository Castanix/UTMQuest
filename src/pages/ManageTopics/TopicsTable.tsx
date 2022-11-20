/* eslint-disable react/jsx-props-no-spreading */
import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Form, Input, Popconfirm, Table, Typography, Space, Tooltip, Alert, Button } from 'antd';
import React from 'react';
import TopicsType from '../../../backend/types/Topics';
import AddTopic from './AddTopic';
import TopicState from './TopicState';

import "./TopicsTable.css";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    children,
    ...restProps
}) => (
    <td {...restProps}>
        {editing ? (
            <Form.Item
                name={dataIndex}
                style={{ margin: 0 }}
                rules={[
                    {
                        required: true,
                        message: `${title} can't be blank.`,
                    },
                ]}
            >
                <Input showCount maxLength={255} />
            </Form.Item>
        ) : (
            children
        )}
    </td>
);

const TopicsTable = ({ topics, courseId }: { topics: TopicsType[], courseId: string }) => {
    const {
        form,
        data,
        isEditing,
        save,
        cancel,
        editingKey,
        edit,
        isDisabled,
        handleDelete,
        searchTerm,
        onChange,
        addTopicCallback,
        lastTopicAdded } = TopicState(topics);

    const columns = [
        {
            title: 'Topic',
            dataIndex: 'topicName',
            editable: true,
            width: '40%',
            sorter: (a: TopicsType, b: TopicsType) => a.topicName.localeCompare(b.topicName),
            ellipsis: true,
        },
        {
            title: '# Questions',
            dataIndex: 'numQuestions',
            width: '15%',
            sorter: (a: TopicsType, b: TopicsType) => a.numQuestions - b.numQuestions,
        },
        {
            title: 'Manage',
            render: (_: any, record: TopicsType) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => save(record._id)} style={{ marginRight: 8 }}>
                            Save
                        </Typography.Link>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                            <Typography.Link>Cancel</Typography.Link>
                        </Popconfirm>
                    </span>
                ) : (
                    <span>
                        <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)} style={{ marginRight: 8 }}>
                            <span>Rename</span>
                        </Typography.Link>
                        <Popconfirm disabled={isDisabled(record)} title="Sure to delete?" onConfirm={() => handleDelete(record._id)}>
                            <Space>
                                <Typography.Link>
                                    <span className={isDisabled(record) ? 'delete-disabled' : 'delete'}>Delete</span>
                                </Typography.Link>
                                {isDisabled(record)
                                    ? (
                                        <Tooltip title="Topics must have no questions before they can be deleted.">
                                            <QuestionCircleOutlined />
                                        </Tooltip>
                                    ) : null}
                            </Space>
                        </Popconfirm>
                    </span>

                );
            },
        },
    ];

    const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: TopicsType) => ({
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <Form form={form} component={false}>
            <div className='toolbar'>
                <Input className="manage-topic-search" placeholder="Search topic" prefix={<SearchOutlined />} value={searchTerm} onChange={(event) => onChange(event.target.value)} />
                <AddTopic courseId={courseId} addTopicCallback={addTopicCallback} />
            </div>
            <br />
            {lastTopicAdded != null ?
                <div>
                    <Alert message={<span><Typography.Text ellipsis>{lastTopicAdded.topicName}</Typography.Text> successfully added. Create a question for it here: </span>}
                        type="success"
                        action={
                            <Link
                                to={`/courses/${courseId}/addQuestion`}
                                state={{ defaultTopicId: lastTopicAdded._id, defaultTopicName: lastTopicAdded.topicName }}
                            >
                                <Button type="link">
                                    Add Question
                                </Button>
                            </Link>
                        }
                        showIcon
                    />
                    <br />
                </div>
                :
                null
            }
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                className='table'
                rowKey="_id"
                dataSource={data}
                columns={mergedColumns}
                rowClassName="editable-row"
                bordered
                pagination={{
                    onChange: cancel,
                    hideOnSinglePage: true,
                    showSizeChanger: true,
                }}
            />
        </Form>
    );
};

export default TopicsTable;