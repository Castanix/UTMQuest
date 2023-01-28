import { Button, Form, Modal, Popover, Radio, RadioChangeEvent, Select, SelectProps } from "antd";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FormOutlined } from "@ant-design/icons";
import TopicsType from "../../../backend/types/Topics";

const { Item } = Form;

const QuizGenerationMenu = ({ courseId, topics }: { courseId: string, topics: TopicsType[] }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [numQns, setNumQns] = useState<number>(10);
    

    const topicOptions: SelectProps['options'] = useMemo(
        /* eslint-disable-next-line arrow-body-style */
        () => topics.map(topic => {
            return { label: topic.topicName, value: topic.topicName };
        }),
        [topics]
    );


    const handleTopicChanges = (value: string[]) => setSelectedTopics(value);
    
    const handleNumQnsChanges = (e: RadioChangeEvent) => setNumQns(e.target.value);

    return (
        <>
            <Button 
                type="primary" 
                shape="round" 
                icon={<FormOutlined />}
                onClick={() => setIsModalOpen(true)}
            >Generate Quiz</Button>

            <Modal 
                title="Generate a quiz" 
                open={isModalOpen}
                onOk={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
                footer={<Link to={`/courses/${courseId}/quiz`} state={{ topicsGen: selectedTopics, numQnsGen: numQns }}><Button type="primary">OK</Button></Link>}
            >
                <Form>
                    <Item label="Topics">
                        <Select
                            mode="multiple"
                            placeholder="Leave empty to include all topics"
                            allowClear
                            onChange={handleTopicChanges}
                            options={topicOptions}
                        />
                    </Item>
                    <Item label={
                        <Popover content="If selected number of questions exceeds amount of questions available, all available questions will be used">
                            <p>Number of Questions</p>
                        </Popover>
                    }>
                        <Radio.Group defaultValue={10} onChange={handleNumQnsChanges} >
                            <Radio value={5}>5</Radio>
                            <Radio value={10}>10</Radio>
                            <Radio value={20}>20</Radio>
                        </Radio.Group>
                    </Item>
                </Form>
            </Modal>
        </>
    );
};

export default QuizGenerationMenu;