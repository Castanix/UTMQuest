/* eslint-disable react/destructuring-assignment */
import { Col, Row, Space, Typography } from "antd";
import React, { useContext } from "react";
import { QuestionsType } from "../../../backend/types/Questions";
import { ThemeContext } from "../Topbar/Topbar";

import "./ViewChanges.css";

const RenderDiff = ({ title, oldField, newField }: { title: string, newField: string, oldField: string }) => {
    const isLightMode = useContext(ThemeContext);

    return (
        <div>
            <Row gutter={[32, 16]}>
                <Col span={8}>
                    {title}
                </Col>
                <Col span={8}>
                    <span className={"new".concat(isLightMode ? " new-light" : " new-dark")}>
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
                    <span className={"old".concat(isLightMode ? " old-light" : " old-dark")}>
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
};

const ViewChanges = (firstQuestion: QuestionsType, secondQuestion: QuestionsType) => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {firstQuestion.topicId !== secondQuestion.topicId ? <RenderDiff title="Topic" oldField={firstQuestion.topicName} newField={secondQuestion.topicName} /> : null}
        {firstQuestion.qnsName !== secondQuestion.qnsName ? <RenderDiff title="Title" oldField={firstQuestion.qnsName} newField={secondQuestion.qnsName} /> : null}
        {firstQuestion.qnsType !== secondQuestion.qnsType ? <RenderDiff title="Topic" oldField={firstQuestion.qnsType ?? ""} newField={secondQuestion.qnsType ?? ""} /> : null}
        {firstQuestion.desc !== secondQuestion.desc ? <RenderDiff title="Problem Description" oldField={firstQuestion.desc} newField={secondQuestion.desc} /> : null}
        {JSON.stringify(firstQuestion.choices) !== JSON.stringify(secondQuestion.choices) ? <RenderDiff title="Multiple Choice Options" oldField={firstQuestion.choices.join(", ")} newField={secondQuestion.choices.join(", ")} /> : null}
        {JSON.stringify(firstQuestion.ans) !== JSON.stringify(secondQuestion.ans) ? <RenderDiff title="Answer" oldField={Array.isArray(firstQuestion.ans) ? firstQuestion.ans.join(", ") : firstQuestion.ans} newField={Array.isArray(secondQuestion.ans) ? secondQuestion.ans.join(", ") : secondQuestion.ans} /> : null}
        {firstQuestion.xplan !== secondQuestion.xplan ? <RenderDiff title="Explanation" oldField={firstQuestion.xplan} newField={secondQuestion.xplan} /> : null}
    </Space>
);

export default ViewChanges;