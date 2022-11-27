import { Button, Card, Col, Divider, List, Row, Skeleton, Space, Typography } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuestionOutlined } from '@ant-design/icons';
import { QuestionsType } from '../../../backend/types/Questions';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import GetEditHistory from './fetch/GetEditHistory';
import ViewChanges from './ViewChanges';
import "./EditHistory.css";
import DisplayBadges from '../DisplayBadges/DisplayBadges';
import GetRelativeTime from '../../RelativeTime';
import { GetUserInitials } from '../../pages/QuestionsPage/QuestionsList';


export const onMobile = () => window.innerWidth < 420;

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

export const GetUsername = (question: QuestionsType) => {
    const { anon, authId, authName } = question;

    if (anon) {
        return <Typography.Text>{authName}</Typography.Text>;
    }

    return <Link to={`/profile/${authId}`}>{authName}</Link>;
};

/* Render a list item for each edit in the history */
const GetListItem = (loading: boolean, display: string, actions: React.ReactNode[], question: QuestionsType) => {
    const photo = question.anon ? <QuestionOutlined /> : <p>{GetUserInitials(question.authName)}</p>;

    return (
        <Skeleton avatar title={false} loading={loading} active>
            <List.Item
                actions={[
                    <Space className="edit-history-list-actions" direction={!onMobile() ? "horizontal" : "vertical"} split={<Divider className="edit-history-list-action-divider" type="vertical" />}>
                        {actions.map((item: any) => <span key={item?.key}>{item}</span>)}
                    </Space>
                ]}
            >
                <List.Item.Meta
                    avatar={
                        <div className='edit-history-list-img'>
                            {photo}
                        </div>
                    }
                    title={
                        <div>
                            <Space direction="vertical" size={0}>
                                <span>
                                    {GetUsername(question)}
                                    {!question.anon ? <DisplayBadges utorid={question.authId} /> : null}
                                </span>
                                <Typography.Text type="secondary">{GetRelativeTime(new Date(question.date).getTime())}</Typography.Text>
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

        display += `Made changes to the `;
        const list = new Intl.ListFormat('en', { style: changes.length > 3 ? "narrow" : "long", type: "conjunction" });
        display += list.format(changes.slice(0, 3));

        if (changes.length > 3) display += `, and ${changes.length - 3} other field(s)`;

        else display += " field(s)";


        const actions: React.ReactNode[] = [];

        if (changes.length > 0) {
            actions.push(
                <Button
                    key={`${firstQuestion._id} change-log`}
                    href="#change-log"
                    shape="round"
                    onClick={() => setChangeLog(ViewChanges(firstQuestion, secondQuestion))}>
                    View Changes
                </Button>
            );
        };

        // can't restore to most recent post (should use edit instead)
        if (index !== 0) {
            actions.push(
                <Link key={`${firstQuestion._id} restore`} to={`/courses/${firstQuestion.courseId}/editQuestion`} state={{ question: firstQuestion, latest: editHistory[0] }}>
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
        const actions: React.ReactNode[] = [];

        if (editHistory.length > 1) {
            actions.push(
                <Link key={originalQuestion._id} to={`/courses/${originalQuestion.courseId}/editQuestion`} state={{ question: originalQuestion, latest: editHistory[0] }}>
                    <Button shape="round">
                        Restore
                    </Button>
                </Link>
            );
        };

        renderList.push(GetListItem(loading, "Made the original post.", actions, originalQuestion));
    }

    return (
        <div className='edit-history-container'>
            <Row gutter={[32, 16]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={changeLog ? 12 : 24}>
                    <List
                        size="large"
                        bordered
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            hideOnSinglePage: true,
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