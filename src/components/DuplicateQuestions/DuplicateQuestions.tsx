import { InfoCircleOutlined } from "@ant-design/icons";
import { List, message, Space } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./DuplicateQuestions.css";

interface HighlightTextsType {
    value: string;
    type: string;
}

interface HighightType {
    score: number;
    path: string;
    texts: HighlightTextsType[];
}

function escapeSpecialChars(str: string) {
    const reg = /(<([^>]+)>)/ig;
    return str
        .replace(reg, "");
}

export interface DuplicateQuestionType {
    _id: string;
    qnsLink: string;
    qnsName: string;
    description: string;
    score: number;
    highlights: HighightType[];
}

const BoldHits = (highlights: HighlightTextsType[]) => {
    let text = "";

    highlights.forEach((item) => {
        const cleanText = escapeSpecialChars(item.value);
        if (item.type === "text") {
            text += cleanText;
        }
        else {
            text += `<b>${cleanText}</b>`;
        }

    });
    return { __html: `... ${text} ...` };
};

const DuplicateQuestions = (courseId: string, topicId: string, searchTerm: string, originalQnsId: string) => {
    const [duplicateQuestions, setDuplicateQuestions] = useState<DuplicateQuestionType[]>([]);

    useEffect(() => {
        if (searchTerm.length < 3) return;
        fetch(`${process.env.REACT_APP_API_URI}/question/similar/${topicId}/${originalQnsId}/${searchTerm}`)
            .then((result) => {
                if (!result.ok) throw new Error("Could not fetch similar questions.");
                return result.json();
            }).then((response) => {
                setDuplicateQuestions(response);
            }).catch((error) => {
                message.error(error);
            });
    }, [topicId, searchTerm, originalQnsId]);

    if (searchTerm.length < 3 || duplicateQuestions.length < 1) return <div />;

    return (
        <div className="duplicate-questions-container">
            <Space direction="vertical">
                Possible duplicates:
                <List
                    className={duplicateQuestions.length > 5 ? "duplicates-list duplicates-list-scroll" : "duplicates-list"}
                    bordered
                    size="small"
                    dataSource={duplicateQuestions}
                    renderItem={item => item.highlights.length !== 0 ? (
                        <List.Item>
                            <div>
                                <Space direction="vertical">
                                    <Link to={`/courses/${courseId}/question/${item.qnsLink}`} target="_blank">
                                        <span>
                                            <Space>
                                                <InfoCircleOutlined />
                                                {item.qnsName}
                                            </Space>
                                        </span>
                                    </Link>
                                    {/* eslint-disable-next-line react/no-danger */}
                                    <span dangerouslySetInnerHTML={BoldHits(item.highlights[0].texts)} />
                                </Space>
                            </div>
                        </List.Item>
                    ) : null}
                />
            </Space>
        </div>
    );
};

export default DuplicateQuestions;