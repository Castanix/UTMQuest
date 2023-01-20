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

const ViewChanges = (firstQns: QuestionsType, secondQns: QuestionsType) => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {firstQns.topicId !== secondQns.topicId ? <RenderDiff title="Topic" newField={firstQns.topicName} oldField={secondQns.topicName} /> : null}
        {firstQns.qnsName !== secondQns.qnsName ? <RenderDiff title="Title" newField={firstQns.qnsName} oldField={secondQns.qnsName} /> : null}
        {firstQns.qnsType !== secondQns.qnsType ? <RenderDiff title="Question type" newField={firstQns.qnsType ?? ""} oldField={secondQns.qnsType ?? ""} /> : null}
        {firstQns.description !== secondQns.description ? <RenderDiff title="Problem Description" newField={firstQns.description} oldField={secondQns.description} /> : null}
        {JSON.stringify(firstQns.choices) !== JSON.stringify(secondQns.choices) ? <RenderDiff title="Multiple Choice Options" newField={firstQns.choices.join(", ")} oldField={secondQns.choices.join(", ")} /> : null}
        {JSON.stringify(firstQns.answers) !== JSON.stringify(secondQns.answers) ? <RenderDiff title="Answer" newField={Array.isArray(firstQns.answers) ? firstQns.answers.join(", ") : firstQns.answers} oldField={Array.isArray(secondQns.answers) ? secondQns.answers.join(", ") : secondQns.answers} /> : null}
        {firstQns.explanation !== secondQns.explanation ? <RenderDiff title="Explanation" newField={firstQns.explanation} oldField={secondQns.explanation} /> : null}
    </Space>
);

export default ViewChanges;