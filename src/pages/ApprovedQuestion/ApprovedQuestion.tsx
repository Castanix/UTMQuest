import React, { useState } from "react";
import './ApprovedQuestion.css';
import MDEditor from '@uiw/react-md-editor';
import { Breadcrumb, Button, Card, Typography } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { CaretLeftOutlined, EditOutlined, WarningFilled } from "@ant-design/icons";
import MultipleChoice from "../../components/MultipleChoice/MultipleChoice";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { TypeOfQuestion } from './types/QuestionTypes';
import { QuestionsType } from "../../../backend/types/Questions";
import ShortAnswer from "../../components/ShortAnswer/ShortAnswer";
import GetQuestion from "./fetch/GetQuestion";
import Discussion from "../../components/Discussion/Discussion";
import EditHistory, { onMobile } from "../../components/EditHistory/EditHistory";
import DisplayBadges from "../../components/DisplayBadges/DisplayBadges";
import GetRelativeTime from "../../RelativeTime";

const { Text, Title } = Typography;

const QuestionTab = ({ options, answers, actualQuestion, explanation }:
    { options: string[], answers: string[], actualQuestion: string, explanation: string }) => (
    <div>
        <Title level={3} className='divider-title'>Problem</Title>
        <MDEditor.Markdown warpperElement={{ "data-color-mode": "light" }} source={actualQuestion} />
        <br />
        <br />
        <Title level={3} className='divider-title'>Your answer</Title>
        <MultipleChoice options={options} answers={answers} explanation={explanation} />
    </div>
);

const ShortAnswerTab = ({ actualQuestion, answer }: { actualQuestion: string, answer: string }) => (
    <div>
        <Title level={3} className='divider-title'>Problem</Title>
        <MDEditor.Markdown warpperElement={{ "data-color-mode": "light" }} source={actualQuestion} />
        <br />
        <br />
        <Title level={3} className='divider-title'>Your answer</Title>
        <ShortAnswer answer={answer} />
    </div>
);


const Header = ({ question }: { question: QuestionsType }) => (
    <div>
        {!onMobile() ?
            <div>
                <Breadcrumb>
                    <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/courses/${question.courseId}`}>{question.courseId}</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`/courses/${question.courseId}/browse`}>Browse Questions</Link></Breadcrumb.Item>
                    <Typography.Text ellipsis>{question.qnsName}</Typography.Text>
                </Breadcrumb>
            </div>
            :
            <Breadcrumb>
                <Breadcrumb.Item><Link to={`/courses/${question.courseId}/browse`}><CaretLeftOutlined />Browse Questions</Link></Breadcrumb.Item>
            </Breadcrumb>
        }
        <div className="title">
            <div className="title-flex">
                {!onMobile() ?
                    <Title level={3} ellipsis>{question.courseId} <div className="subtitle">&#8226; {question.topicName}</div></Title>
                    :
                    <div>
                        <Title level={4} ellipsis>{question.courseId}</Title>
                        <div className="subtitle">{question.topicName}</div>
                    </div>
                }
                <Text type="secondary">{question.authName} {!question.anon ? <DisplayBadges utorid={question.authId} /> : null}</Text> <br />
                <Text type="secondary">{GetRelativeTime(new Date(question.date).getTime())}</Text>
            </div>
            <div className="icon-buttons">
                <div className="flex-child">
                    <Link to={`/courses/${question.courseId}/editQuestion`} state={{ question }}><Button type="primary" shape="round" icon={<EditOutlined />}>Edit</Button></Link>
                </div>
                <div className="flex-child">
                    <Button type="primary" shape="round" danger icon={<WarningFilled />}>Report</Button>
                </div>
            </div>
        </div>
    </div>
);

const getQuestionType = (question: QuestionsType) => ({
    mc: <QuestionTab options={question.choices} answers={question.ans as string[]} actualQuestion={question.desc} explanation={question.xplan} />,
    short: <ShortAnswerTab actualQuestion={question.desc} answer={question.ans as string} />
});

const QuestionType = ({ question, qnsType }: { question: QuestionsType, qnsType: keyof TypeOfQuestion }) => <div>{getQuestionType(question)[qnsType]}</div>;

const tabList = [
    {
        key: 'Question',
        tab: 'Question',
    },
    {
        key: 'Discussion',
        tab: 'Discussion',
    },
    {
        key: 'EditHistory',
        tab: 'Edit History'
    }
];

const ApprovedQuestion = () => {
    const [activeTabKey, setActiveTabKey] = useState<string>('Question');
    const params = useParams();
    const link = params.link ?? '';
    const { loading, question, error } = GetQuestion(link);

    if (loading) return <Loading />;

    if (error !== '' || question === undefined) return <ErrorMessage title={error !== '' ? error : 'Could not find question'} link="/courses" message="Go back to courses" />;

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
    };

    const contentList: Record<string, React.ReactNode> = {
        Question: <QuestionType question={question} qnsType={question.qnsType as keyof TypeOfQuestion} />,
        Solution: <p>Solution</p>,
        Discussion: <Discussion questionLink={question.link} />,
        EditHistory: <EditHistory link={question.link} />
    };

    return (
        <Card
            style={{ width: '100%' }}
            title={<Header question={question} />}
            tabList={tabList}
            activeTabKey={activeTabKey}
            onTabChange={key => {
                onTabChange(key);
            }}
            bordered={false}
        >
            <main className="main-container">
                {contentList[activeTabKey]}
            </main>
        </Card>
    );
};

export default ApprovedQuestion;