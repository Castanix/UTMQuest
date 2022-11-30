import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal } from 'antd';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import TopicsType from '../../../backend/types/Topics';

type onCreateCallback = (topicName: string) => void; // eslint-disable-line no-unused-vars
type addTopicCallbackType = (topic: TopicsType | null) => void; // eslint-disable-line no-unused-vars

interface CollectionCreateFormProps {
    open: boolean;
    courseId: string;
    onCreate: onCreateCallback;
    onCancel: () => void;
}

const addTopic = async (topicName: string, courseId: string) => {
    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, topicName })
    };
    const response = await fetch(`${process.env.REACT_APP_API_URI}/topic/addTopic`, request);

    if (!response.ok) {
        message.error(response.statusText);
        return Promise.reject();
    }

    return response.json();
};

const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
    open,
    courseId,
    onCreate,
    onCancel,
}) => {
    const [form] = Form.useForm();
    return (
        <Modal
            open={open}
            title={`Add a topic for ${courseId}`}
            okText="Save"
            cancelText="Cancel"
            onCancel={onCancel}
            footer={[
                <Button key="cancel" shape="round" onClick={() => onCancel()}>
                    Cancel
                </Button>,
                <Button key="ok" type="primary" shape="round" onClick={() => {
                    form
                        .validateFields()
                        .then(values => {
                            form.resetFields();
                            const name = values.name.trim();
                            if (name) {
                                onCreate(name);
                            } else {
                                message.error('Cannot add empty topic names');
                            }
                        })
                        .catch(info => {
                            console.log('Validate Failed:', info);
                        });
                }}>
                    Save
                </Button>
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
                initialValues={{ modifier: 'public' }}
            >
                <Form.Item
                    name="name"
                    label="Topic Name"
                    rules={[{ required: true, message: 'Please add a topic name' }]}
                >
                    <Input placeholder="Add new topic" showCount maxLength={255} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const AddTopic = ({ courseId, addTopicCallback }: { courseId: string, addTopicCallback: addTopicCallbackType }) => {
    const [open, setOpen] = useState(false);

    const queryClient = useQueryClient();
    const mutation = useMutation((topicName: string) => addTopic(topicName, courseId), {

        // onMutate: async topicName => {
        //     await queryClient.cancelQueries({ queryKey: ["fetchTopics", courseId] });

        //     const previousData: TopicsType[] = queryClient.getQueryData(["fetchTopics", courseId]) ?? [];

        //     const newTopic: TopicsType = {
        //         _id: Math.random().toString(),
        //         topicName,
        //         course: courseId,
        //         numQuestions: 0
        //     };

        //     const newData = [...previousData, newTopic];

        //     queryClient.setQueryData(["fetchTopics", courseId], newData);
        //     addTopicCallback(newTopic);
        //     setOpen(false);

        //     return { previousData };
        // },
        // onError: (err, topicName, context) => {
        //     queryClient.setQueryData(["fetchTopics", courseId], context?.previousData);
        //     addTopicCallback(null);
        //     message.error("An error occurred when processing the request. Rolled back to previous state.");
        // },
        onSuccess: (data, topicName) => {
            const newTopic: TopicsType = {
                _id: data.insertedId,
                topicName,
                course: courseId,
                numQuestions: 0
            };

            const previousData: TopicsType[] = queryClient.getQueryData(["fetchTopics", courseId]) ?? [];
            const newData = [...previousData, newTopic];
            queryClient.setQueryData(["fetchTopics", courseId], newData);
            addTopicCallback(newTopic);
            setOpen(false);
            // queryClient.invalidateQueries(["fetchTopics", courseId]);
        },
    });

    const onCreate = (topicName: string) => {
        mutation.mutate(topicName);
        // const request = {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ courseId, topicName })
        // };

        // const topic: TopicsType = {
        //     _id: '',
        //     topicName,
        //     course: courseId,
        //     numQuestions: 0
        // };

        // fetch(`${process.env.REACT_APP_API_URI}/topic/addTopic`, request).then((result) => {
        //     if (!result.ok) throw new Error("Could not add topic. Ensure the topic hasn't already been added and try again.");
        //     return result.json();
        // }).then((response) => {
        //     topic._id = response.insertedId;
        //     addTopicCallback(topic);
        //     setOpen(false);
        // }).catch((error) => {
        //     message.error(error.message);
        // });
    };

    return (
        <div>
            <Button type="primary" icon={<PlusCircleOutlined />} shape="round" className='add-new-topic' onClick={() => setOpen(true)}>
                Add a new topic
            </Button>
            <CollectionCreateForm
                open={open}
                courseId={courseId}
                onCreate={onCreate}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </div>
    );
};

export default AddTopic;