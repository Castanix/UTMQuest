/* eslint-disable */
import { InfoCircleOutlined } from "@ant-design/icons";
import { List, message, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./DuplicateQuestions.css";

interface HighlightTextsType {
    value: string;
    type: string;
}

function escapeSpecialChars(str: string) {
    const reg = /(<([^>]+)>)/ig
    return str
        .replace(reg, "");
}

interface DuplicateQuestionType {
    _id: string;
    qnsName: string;
    desc: string;
    score: number;
    highlights: [{ score: number, path: string, texts: HighlightTextsType[] }]
}

const BoldHits = (highlights: HighlightTextsType[]) => {
    let text = "";

    highlights.forEach((item) => {
        let cleanText = escapeSpecialChars(item.value);
        if (item.type === "text") {
            text += cleanText;
        }
        else {
            text += `<b>${cleanText}</b>`;
        }

    })
    return { __html: "... " + text + " ..." };
}

const DuplicateQuestions = (courseId: string, topicId: string, searchTerm: string) => {
    const [duplicateQuestions, setDuplicateQuestions] = useState<DuplicateQuestionType[]>([]);

    useEffect(() => {
        if (searchTerm.length < 3) return;
        fetch(`${process.env.REACT_APP_API_URI}/question/similar/${topicId}/${searchTerm}`)
            .then((result) => {
                if (!result.ok) throw new Error("Could not fetch similar questions.");
                return result.json();
            }).then((response) => {
                setDuplicateQuestions(response);
            }).catch((error) => {
                message.error(error);
            })
    }, [topicId, searchTerm])

    if (searchTerm.length < 3 || duplicateQuestions.length < 1) return;

    return (
        <div>
            <Space direction="vertical">
                Possible duplicates:
                <List
                    className={duplicateQuestions.length > 5 ? "duplicates-list-scroll" : ""}
                    bordered
                    size="small"
                    dataSource={duplicateQuestions}
                    renderItem={item => (
                        <List.Item>
                            <div>
                                <Space direction="vertical">
                                    <Link to={`/courses/${courseId}/question/${item._id}`} target="_blank">
                                        <span>
                                            <Space>
                                                <InfoCircleOutlined />
                                                {item.qnsName}
                                            </Space>
                                        </span>
                                    </Link>
                                    <span dangerouslySetInnerHTML={BoldHits(item.highlights[0].texts)} />
                                </Space>
                            </div>
                        </List.Item>
                    )}
                />
            </Space>
        </div>
    )
}

export default DuplicateQuestions;