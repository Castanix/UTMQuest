import React, { useState } from "react";
import './ApprovedQuestion.css';
import MDEditor from '@uiw/react-md-editor';
import { Breadcrumb, Button, Card } from 'antd';
import { Link, useParams } from 'react-router-dom';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import { EditTwoTone, WarningFilled } from "@ant-design/icons";
import MultipleChoice from "../../components/MultipleChoice/MultipleChoice";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { TypeOfQuestion } from './types/QuestionTypes';
import { QuestionsType } from "../../../backend/types/Questions";
import ShortAnswer from "../../components/ShortAnswer/ShortAnswer";
import GetQuestion from "./fetch/GetQuestion";
import Discussion from "../../components/Discussion/Discussion";
import EditHistory from "../../components/EditHistory/EditHistory";


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
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/courses">Courses</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${question.courseId}`}>{question.courseId}</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${question.courseId}/browse`}>Browse Questions</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{question.qnsName}</Breadcrumb.Item>
        </Breadcrumb>
        <div className="title">
            <div className="title-flex">
                <Title level={3} ellipsis>{question.courseId} <div className="subtitle">&#8226; {question.topicName}</div></Title>
                <Text type="secondary">{`by ${question.authName} on ${new Date(question.date).toDateString()}`}</Text>
            </div>
            <div className="icon-buttons">
                <div className="flex-child">
                    <Link to={`/courses/${question.courseId}/editQuestion`} state={{ question }}><Button type="link" icon={<EditTwoTone style={{ fontSize: '1.35rem', alignItems: 'center' }} />} /></Link>
                    <p className="icon-text">Edit</p>
                </div>
                <div className="flex-child">
                    <Button type="link" danger icon={<WarningFilled style={{ fontSize: '1.35rem', alignItems: 'center' }} />} />
                    <p className="icon-text report-text">Report</p>
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
        Discussion: <Discussion questionId={question._id} />,
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