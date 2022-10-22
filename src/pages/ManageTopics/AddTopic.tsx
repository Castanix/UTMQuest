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
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        onCreate(values.name);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
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
                    <Input />
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
            course: courseId,
            numApproved: 0,
            numPending: 0
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
            <Button type="primary" icon={<PlusCircleOutlined />} shape="round" className='addNewTopic' onClick={() => setOpen(true)}>
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