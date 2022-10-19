/* eslint-disable react/jsx-props-no-spreading */
import { PlusCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Form, Input, Popconfirm, Table, Typography, message, Space, Tooltip, Button } from 'antd';
import React, { useState } from 'react';
import TopicsType from '../../../backend/types/Topics';

import "./TopicsTable.css"

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    inputType: string;
    record: TopicsType;
    index: number;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
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
                <Input />
            </Form.Item>
        ) : (
            children
        )}
    </td>
);

const TopicsTable = ({ topics }: { topics: TopicsType[] }) => {
    const [form] = Form.useForm();
    const [originalData, setOriginalData] = useState<TopicsType[]>(topics);
    const [data, setData] = useState<TopicsType[]>(topics);
    const [editingKey, setEditingKey] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const isEditing = (record: TopicsType) => record._id === editingKey;

    const isDisabled = (record: TopicsType) => record.numApproved + record.numPending > 0;

    const onChange = (value: string) => {
        setSearchTerm(value);
        setData(originalData.filter(item => item.topicName.toLowerCase().includes(value.toLowerCase())));
    }

    const edit = (record: Partial<TopicsType> & { _id: React.Key }) => {
        form.setFieldsValue({ topicName: '', ...record });
        setEditingKey(record._id ?? '');
    };

    const cancel = () => {
        setEditingKey('');
    };

    const handleDelete = (key: React.Key) => {
        const newData = originalData.filter(item => item._id !== key);
        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: key })
        }
        fetch(`${process.env.REACT_APP_API_URI}/topic/deleteTopic`, request).then((result) => {
            if (!result.ok) {
                message.error("Could not delete topic. Please try again.")
                return;
            }
            message.success("Topic successfully deleted.")
            setData(newData);
            setOriginalData(newData);
            setSearchTerm('');
        }).catch(() => {
            message.error("Could not delete topic. Please try again.")
        })
    };

    const save = async (key: React.Key) => {
        try {
            const row = (await form.validateFields()) as TopicsType;

            const newData = [...originalData];
            const index = newData.findIndex(item => key === item._id);
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                ...row,
            });
            const request = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: key, newTopic: row.topicName })
            }

            fetch(`${process.env.REACT_APP_API_URI}/topic/putTopic`, request).then((result) => {
                if (!result.ok) {
                    message.error("Could not save topic. Please try again.")
                    return;
                }
                message.success("Topic successfully saved.")
                setData(newData);
                setOriginalData(newData);
                setSearchTerm('');
                setEditingKey('');
            }).catch(() => {
                message.error("Could not save topic. Please try again.")
            })

        } catch (errInfo) {
            message.error("Please enter a topic name.")
        }
    };

    const columns = [
        {
            title: 'Topic',
            dataIndex: 'topicName',
            editable: true,
            width: '40%',
        },
        {
            title: '# Questions',
            dataIndex: 'numApproved',
            width: '15%'
        },
        {
            title: '# Questions Pending Review',
            dataIndex: 'numPending',
            width: '15%'
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
                                    <span className={isDisabled(record) ? 'deleteDisabled' : 'delete'}>Delete</span>
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
                record,
                inputType: 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <Form form={form} component={false}>
            <div className='toolbar'>
                <Input placeholder="Search topic" prefix={<SearchOutlined />} value={searchTerm} onChange={(event) => onChange(event.target.value)} />
                <Button type="primary" icon={<PlusCircleOutlined />} shape="round" className='addNewTopic'>
                    Add a new topic
                </Button>
            </div>
            <br />
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                className='table'
                rowKey="_id"
                dataSource={data}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={{
                    onChange: cancel,
                }}
            />
        </Form>
    );
};

export default TopicsTable;