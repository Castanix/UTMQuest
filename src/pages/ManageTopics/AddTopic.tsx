import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal } from 'antd';
import React, { useState } from 'react';
import TopicsType from '../../../backend/types/Topics';

type onCreateCallback = (topicName: string) => void; // eslint-disable-line no-unused-vars
type addTopicCallbackType = (topic: TopicsType) => void; // eslint-disable-line no-unused-vars

interface CollectionCreateFormProps {
    open: boolean;
    courseId: string;
    onCreate: onCreateCallback;
    onCancel: () => void;
}

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

    const onCreate = (topicName: string) => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, topicName })
        };

        const topic: TopicsType = {
            _id: '',
            topicName,
            courseId,
            numQns: 0
        };

        fetch(`${process.env.REACT_APP_API_URI}/topic/addTopic`, request).then((result) => {
            if (!result.ok) throw new Error("Could not add topic. Ensure the topic hasn't already been added and try again.");
            return result.json();
        }).then((response) => {
            topic._id = response.insertedId;
            addTopicCallback(topic);
            setOpen(false);
        }).catch((error) => {
            message.error(error.message);
        });
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