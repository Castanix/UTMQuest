import { Alert, Button, Form, message, Select } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import TopicsType from "../../../backend/types/Topics";

const AQStepOne = ({ courseCode, topics, setCurrStep, setTopicSelected }: 
    { courseCode: string, topics: TopicsType[], setCurrStep: Function, setTopicSelected: Function }) => {

    const [selected, setSelected] = useState<string>();
    const [searchValue, setSearchValue] = useState<string>();

    const { Option } = Select;

    const initSelect = () => {
        const topicArr: React.ReactNode[] = [];

        topics.forEach(item => {
            topicArr.push(<Option key={item._id} value={item._id}>{item.topicName}</Option>);
        });

        return topicArr;
    };

    return (
        <>
            <Alert message="If the topic you are trying to select does not exist, please add it here:"
                type="info"
                action={
                    <Link to={`/courses/${courseCode}/topics`}>Manage Topic</Link>
                }
                showIcon 
            />
            <br/>
            <div className="form-container">
                <Form>
                    <Form.Item 
                        name="topic" 
                        label="Select the topic this question is for"
                        colon
                        required
                    >
                        <Select
                            showSearch
                            searchValue={searchValue}
                            optionFilterProp="children"
                            placeholder="Select a topic"
                            style={{ width: 'max(16rem, 20vw)' }}
                            onChange={(value) => setSelected(value)}
                            onSearch={(value) => setSearchValue(value)}
                        >
                            {initSelect()}
                        </Select>   
                    </Form.Item>
                    <Button 
                        type="primary"
                        disabled={!selected}
                        onClick={() => {
                            if(selected) {
                                const name = topics.find(item => item._id === selected)?.topicName;

                                setTopicSelected([selected, name]);
                                setCurrStep(1);
                            } else {
                                message.error("No topic selected");
                            };
                        }}
                    >Next</Button>
                </Form>              
            </div>
        </>
    );
};

export default AQStepOne;