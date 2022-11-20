import { Alert, Button, Form, message, Select } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import TopicsType from "../../../backend/types/Topics";
import { onMobile } from "../../components/EditHistory/EditHistory";

const AQStepOne = ({ courseCode, topics, setCurrStep, setTopicSelected }:
    { courseCode: string, topics: TopicsType[], setCurrStep: Function, setTopicSelected: Function }) => {

    const fullTopicList = topics;
    const [selected, setSelected] = useState<string>();
    const [searchValue, setSearchValue] = useState<string>();

    const { defaultTopicId, defaultTopicName } = useLocation().state ?? "";
    const { question } = useLocation().state ?? "";
    useEffect(() => {
        if (question) {
            const topicId = topics.filter(item => item.topicName === question.topicName)[0]._id;

            setTopicSelected([topicId, question.topicName]);
            setSelected(topicId);
        } else if (defaultTopicId && defaultTopicName) {
            setTopicSelected([defaultTopicId, defaultTopicName]);
            setSelected(defaultTopicId);
        };
    }, [question, topics, setTopicSelected, defaultTopicId, defaultTopicName]);

    const { Option } = Select;

    const initSelect = () => {
        const topicArr: React.ReactNode[] = [];

        fullTopicList.forEach(item => {
            topicArr.push(<Option key={item._id} value={item._id}>{item.topicName}</Option>);
        });

        return topicArr;
    };

    const GetSelectInitialValue = () => {
        if (question) return question.topicName;

        if (defaultTopicId !== '' && defaultTopicName !== '') return defaultTopicName;

        return null;
    };

    return (
        <>
            <Alert message="If the topic you are trying to select does not exist, please add it here:"
                type="info"
                action={
                    <Link to={`/courses/${courseCode}/topics`}>
                        <Button type="link">
                            Manage Topics
                        </Button>
                    </Link>
                }
                showIcon
            />
            <br />
            <div className="form-container">
                <Form layout={!onMobile() ? "horizontal" : "vertical"}>
                    <Form.Item
                        name="topic"
                        label="Select the topic this question is for"
                        colon
                        required
                        initialValue={GetSelectInitialValue()}
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
                        shape="round"
                        type="primary"
                        disabled={!selected}
                        onClick={() => {
                            if (selected) {
                                const name = fullTopicList.find(item => item._id === selected)?.topicName;

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