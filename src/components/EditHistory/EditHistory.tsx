import { Button, Card, Col, List, Row, Skeleton, Space, Typography } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuestionOutlined } from '@ant-design/icons';
import { QuestionsType } from '../../../backend/types/Questions';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import GetEditHistory from './fetch/GetEditHistory';
import ViewChanges from './ViewChanges';
import "./EditHistory.css";


const onMobile = () => window.innerWidth < 480;

/* Given two questions, find the difference in their fields */
const GetDiff = (firstQuestion: QuestionsType, secondQuestion: QuestionsType) => {
    const changes = [];

    if (firstQuestion.topicId !== secondQuestion.topicId) changes.push("Topic");

    if (firstQuestion.qnsName !== secondQuestion.qnsName) changes.push("Title");

    if (firstQuestion.qnsType !== secondQuestion.qnsType) changes.push("Question type");

    if (firstQuestion.desc !== secondQuestion.desc) changes.push("Problem description");

    if (JSON.stringify(firstQuestion.choices) !== JSON.stringify(secondQuestion.choices)) changes.push("Multiple choice options");

    if (JSON.stringify(firstQuestion.ans) !== JSON.stringify(secondQuestion.ans)) changes.push("Answer");

    if (firstQuestion.xplan !== secondQuestion.xplan) changes.push("Explanation");

    return changes;
};

/* Render a list item for each edit in the history */
const GetListItem = (loading: boolean, display: string, actions: React.ReactNode[], question: QuestionsType) => {
    const name = question.authName.split(" ");
    const firstInitial = name[0][0];
    const lastInitial = name[name.length - 1][0];
    const date = onMobile() ? new Date(question.date).toLocaleDateString() : new Date(question.date).toDateString();
    const photo = question.anon ? <QuestionOutlined /> : <p>{firstInitial.concat(lastInitial)}</p>;

    return (
        <Skeleton avatar title={false} loading={loading} active>
            <List.Item
                actions={[...actions]}>
                <List.Item.Meta
                    avatar={
                        <div className='edit-history-list-img'>
                            {photo}
                        </div>
                    }
                    title={
                        <div>
                            <Space direction="vertical" size={0}>
                                {name.join(" ")}
                                < Typography.Text type="secondary">{date}</Typography.Text>
                            </Space>
                        </div>
                    }
                    description={
                        <Typography.Paragraph className="edit-history-list-display">
                            {display}
                        </Typography.Paragraph>
                    }
                />
            </List.Item>
        </Skeleton >
    );
};

const EditHistory = ({ link }: { link: string }) => {

    const { loading, editHistory, error } = GetEditHistory(link);

    const [changeLog, setChangeLog] = useState<React.ReactNode>();

    if (error !== '') return <ErrorMessage title={error} link='.' message='Refresh' />;

    const renderList: React.ReactNode[] = [];

    for (let index = 0; index < editHistory.length - 1; index++) {
        const firstQuestion = editHistory[index];
        const secondQuestion = editHistory[index + 1];

        const changes = GetDiff(firstQuestion, secondQuestion);

        let display = "";

        if (changes.length === 0) display += "Made no new changes.";

        else {
            display += `Made changes to the `;
            const list = new Intl.ListFormat('en', { style: changes.length > 3 ? "narrow" : "long", type: "conjunction" });
            display += list.format(changes.slice(0, 3));

            if (changes.length > 3) display += `, and ${changes.length - 3} other field(s)`;

            else display += " field(s)";
        }

        const actions: React.ReactNode[] = [];

        if (changes.length > 0) {
            actions.push(
                <Button
                    href="#change-log"
                    onClick={() => setChangeLog(ViewChanges(firstQuestion, secondQuestion))}>
                    View Changes
                </Button>
            );
        };

        // can't restore to most recent post (should use edit instead)
        if (index !== 0) {
            actions.push(
                <Link to={`/courses/${firstQuestion.courseId}/editQuestion`} state={{ question: firstQuestion, oldVersion: firstQuestion._id }}>
                    <Button shape="round">
                        Restore
                    </Button>
                </Link>
            );
        };

        renderList.push(GetListItem(loading, display, actions, firstQuestion));
    }

    // push original post
    const originalQuestion = editHistory[editHistory.length - 1];
    if (originalQuestion) {
        const actions: React.ReactNode[] = [
            <Link to={`/courses/${originalQuestion.courseId}/editQuestion`} state={{ question: originalQuestion, oldVersion: originalQuestion._id }}>
                <Button shape="round">
                    Restore
                </Button>
            </Link>
        ];

        renderList.push(GetListItem(loading, "Made the original post.", actions, originalQuestion));
    }

    return (
        <div className='edit-history-container'>
            <Row gutter={[32, 16]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={changeLog ? 12 : 24}>
                    <List
                        size="large"
                        pagination={{
                            pageSize: 10,
                        }}
                        className="edit-history-list"
                        itemLayout={onMobile() ? "vertical" : "horizontal"}
                        dataSource={editHistory}
                        renderItem={(_item, index) => (
                            renderList[index]
                        )}
                    />
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                    {changeLog ?
                        <Card className="edit-history-card" title="Change Log" id="change-log">
                            {changeLog}
                        </Card>
                        :
                        null
                    }
                </Col>
            </Row>
        </div>
    );
};

export default EditHistory;