/* eslint-disable react/destructuring-assignment */
import { Col, Row, Space, Typography } from "antd";
import React from "react";
import { QuestionsType } from "../../../backend/types/Questions";

import "./ViewChanges.css";

const RenderDiff = (title: string, newField: string, oldField: string) => (
    <div>
        <Row gutter={[32, 16]}>
            <Col span={8}>
                {title}
            </Col>
            <Col span={8}>
                <span className="new">
                    <Typography.Paragraph
                        ellipsis={{
                            rows: 3,
                            expandable: true,
                        }}>
                        {newField !== "" ?
                            newField
                            :
                            <Typography.Text italic>
                                None
                            </Typography.Text>
                        }
                    </Typography.Paragraph>
                </span>
            </Col>
            <Col span={8}>
                <span className="old">
                    <Typography.Paragraph
                        delete
                        ellipsis={{
                            rows: 3,
                            expandable: true,
                        }}>
                        {oldField !== "" ?
                            oldField
                            :
                            <Typography.Text italic>
                                None
                            </Typography.Text>
                        }
                    </Typography.Paragraph>
                </span>
            </Col>
        </Row>
    </div>
);

const ViewChanges = (firstQuestion: QuestionsType, secondQuestion: QuestionsType) => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {firstQuestion.topicId !== secondQuestion.topicId ? RenderDiff("Topic", firstQuestion.topicName, secondQuestion.topicName) : null}
        {firstQuestion.qnsName !== secondQuestion.qnsName ? RenderDiff("Title", firstQuestion.qnsName, secondQuestion.qnsName) : null}
        {firstQuestion.qnsType !== secondQuestion.qnsType ? RenderDiff("Question Type", firstQuestion.qnsType ?? "", secondQuestion.qnsType ?? "") : null}
        {firstQuestion.desc !== secondQuestion.desc ? RenderDiff("Problem Description", firstQuestion.desc, secondQuestion.desc) : null}
        {JSON.stringify(firstQuestion.choices) !== JSON.stringify(secondQuestion.choices) ? RenderDiff("Multiple Choice Options", firstQuestion.choices.join(", "), secondQuestion.choices.join(", ")) : null}
        {JSON.stringify(firstQuestion.ans) !== JSON.stringify(secondQuestion.ans) ? RenderDiff("Answer", Array.isArray(firstQuestion.ans) ? firstQuestion.ans.join(", ") : firstQuestion.ans, Array.isArray(secondQuestion.ans) ? secondQuestion.ans.join(", ") : secondQuestion.ans) : null}
        {firstQuestion.xplan !== secondQuestion.xplan ? RenderDiff("Explanation", firstQuestion.xplan, secondQuestion.xplan) : null}
    </Space>
);

export default ViewChanges;