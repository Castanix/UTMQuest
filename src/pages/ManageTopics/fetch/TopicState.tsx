import { Form, message } from 'antd'
import React, { useState } from 'react'
import TopicsType from '../../../../backend/types/Topics'


const TopicState = (topics: TopicsType[]) => {
    const [form] = Form.useForm();
    const [originalData, setOriginalData] = useState<TopicsType[]>(topics);
    const [data, setData] = useState<TopicsType[]>(topics);
    const [editingKey, setEditingKey] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const isEditing = (record: TopicsType) => record._id === editingKey;

    const isDisabled = (record: TopicsType) => record.numApproved + record.numPending > 0;

    const addTopicCallback = (topic: TopicsType) => {
        setSearchTerm('');
        setOriginalData([...originalData, topic])
        setData([...originalData, topic]);
    }

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
                if (!result.ok) throw new Error("Could not save topic. Ensure the new name hasn't already been added and try again.")
                message.success("Topic successfully saved.")
                setData(newData);
                setOriginalData(newData);
                setSearchTerm('');
                setEditingKey('');
            }).catch((error) => {
                message.error(error.message)
            })

        } catch (errInfo) {
            message.error("Please enter a topic name.")
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
        addTopicCallback
    }
}

export default TopicState;