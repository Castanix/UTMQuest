import { Alert, Button, Form, message, Select } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import TopicsType from "../../../backend/types/Topics";
import { onMobile } from "../../components/EditHistory/EditHistory";

const AQStepOne = ({ courseId, topics, setCurrStep, setTopicSelected }:
    { courseId: string, topics: TopicsType[], setCurrStep: Function, setTopicSelected: Function }) => {

    const fullTopicList = topics;
    const [selected, setSelected] = useState<string>();
    const [searchValue, setSearchValue] = useState<string>();

    const { defaultTopicId, defaultTopicName } = useLocation().state ?? "";
    const { editableQns } = useLocation().state ?? "";

    useEffect(() => {
        if (editableQns) {
            const { topicId } = editableQns;
            
            setTopicSelected([topicId, editableQns.topicName]);
            setSelected(topicId);
        } else if (defaultTopicId && defaultTopicName) {
            setTopicSelected([defaultTopicId, defaultTopicName]);
            setSelected(defaultTopicId);
        };
    }, [editableQns, topics, setTopicSelected, defaultTopicId, defaultTopicName]);

    const { Option } = Select;

    const initSelect = () => {
        const topicArr: React.ReactNode[] = [];

        let doesTopicIdExist = false;

        fullTopicList.forEach(item => {
            if(editableQns && !doesTopicIdExist) {
                if(item._id === editableQns.topicId) doesTopicIdExist = true;
            };

            topicArr.push(<Option key={item._id} value={item._id}>{item.topicName}</Option>);
        });

        if(editableQns && !doesTopicIdExist) {
            topicArr.push(<Option key={editableQns.topicId} value={editableQns._id}>{editableQns.topicName}</Option>);
            
            const { topicId: _id, topicName } = editableQns;
            fullTopicList.push(
                {
                    _id,
                    topicName,
                    courseId,
                    numQns: 0,
                    deleted: false,
                }
            );
        };

        return topicArr;
    };

    const GetSelectInitialValue = () => {
        if (editableQns) return editableQns.topicName;

        if (defaultTopicId !== '' && defaultTopicName !== '') return defaultTopicName;

        return null;
    };

    return (
        <>
            <Alert message="If the topic you are trying to select does not exist, please add it here:"
                type="info"
                action={
                    <Link to={`/courses/${courseId}/topics`}>
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
