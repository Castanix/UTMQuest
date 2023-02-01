import { Form, message } from 'antd';
import { useQueryClient } from "react-query";
import React, { useState } from 'react';
import { TopicsFrontEndType } from '../../../backend/types/Topics';


const TopicState = (topics: TopicsFrontEndType[], courseId: string) => {
    const [form] = Form.useForm();
    const [originalData, setOriginalData] = useState<TopicsFrontEndType[]>(topics);
    const [data, setData] = useState<TopicsFrontEndType[]>(topics);
    const [editingKey, setEditingKey] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [lastTopicAdded, setLastTopicAdded] = useState<TopicsFrontEndType | null>(null);

    const queryClient = useQueryClient();

    const isEditing = (record: TopicsFrontEndType) => record._id === editingKey;

    const isDisabled = (record: TopicsFrontEndType) => record.numQns > 0;

    const addTopicCallback = (topic: TopicsFrontEndType) => {
        queryClient.invalidateQueries(["getTopics", courseId]);
        setSearchTerm('');
        setOriginalData([...originalData, topic]);
        setData([...originalData, topic]);
        setLastTopicAdded(topic);
    };

    const onChange = (value: string) => {
        setSearchTerm(value);
        setData(originalData.filter(item => item.topicName.toLowerCase().includes(value.toLowerCase())));
    };

    const edit = (record: Partial<TopicsFrontEndType> & { _id: React.Key }) => {
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
        };
        fetch(`${process.env.REACT_APP_API_URI}/topic/deleteTopic`, request).then((result) => {
            if (!result.ok) {
                message.error("Could not delete topic. Please try again.");
                return;
            }
            message.success("Topic successfully deleted.");
            queryClient.invalidateQueries(["getTopics", courseId]);
            setData(newData);
            setOriginalData(newData);
            setSearchTerm('');

            if (lastTopicAdded != null && key === lastTopicAdded._id) {
                setLastTopicAdded(null);
            }

        }).catch(() => {
            message.error("Could not delete topic. Please try again.");
        });
    };

    const save = async (key: React.Key) => {
        try {
            const row = (await form.validateFields()) as TopicsFrontEndType;
            const newTopicName = row.topicName.trim();

            if (!newTopicName) {
                message.error('Cannot save empty topic name');
                return;
            }

            const newData = [...originalData];
            const index = newData.findIndex(item => key === item._id);
            const item = newData[index];

            newData.splice(index, 1, {
                ...item,
                ...row,
            });


            if (item.topicName !== newTopicName) {
                const request = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ _id: key, newTopic: newTopicName })
                };

                fetch(`${process.env.REACT_APP_API_URI}/topic/putTopic`, request).then((result) => {
                    if (!result.ok) throw new Error("Could not save topic. Ensure the new name hasn't already been added and try again.");
                    message.success("Topic successfully saved.");
                    setData(newData);
                    setOriginalData(newData);
                    queryClient.invalidateQueries(["getTopics", courseId]);
                    if (lastTopicAdded != null && key === lastTopicAdded._id) {
                        setLastTopicAdded({ ...item, ...row });
                    }
                }).catch((error) => {
                    message.error(error.message);
                });
            } else {
                message.info('Topic name is the same');
            }
            setSearchTerm('');
            setEditingKey('');

        } catch (errInfo) {
            message.error("Please enter a topic name.");
        }
    };

    return {
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
        lastTopicAdded,
    };
};

export default TopicState;
