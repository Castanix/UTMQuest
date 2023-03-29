import React, { useContext, useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import './ApprovedQuestion.css';
import parse from "html-react-parser";
import { Breadcrumb, Button, Card, Typography } from 'antd';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CaretLeftOutlined, EditOutlined } from "@ant-design/icons";
import MathJax from "better-react-mathjax/MathJax";
import MultipleChoice from "../../components/MultipleChoice/MultipleChoice";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { TypeOfQuestion } from './types/QuestionTypes';
import { QuestionFrontEndType } from "../../../backend/types/Questions";
import ShortAnswer from "../../components/ShortAnswer/ShortAnswer";
import GetQuestion from "./fetch/GetQuestion";
import Discussion from "../../components/Discussion/Discussion";
import EditHistory, { GetUsername, onMobile } from "../../components/EditHistory/EditHistory";
import DisplayBadges from "../../components/DisplayBadges/DisplayBadges";
import GetRelativeTime from "../../RelativeTime";
import QuestionRater from "../../components/QuestionRater/QuestionRater";
import { QuizDependencyTypes } from "../QuizPage/QuizPage";
import { pageList } from "../QuestionsPage/QuestionState";
import { ThemeContext } from "../../components/Topbar/Topbar";

const { Text, Title } = Typography;

const GetTabKey = (key: string) => {

    switch (key) {

        case "Question": return "Question";
        case "Discussion": return "Discussion";
        case "EditHistory": return "EditHistory";

        default: return "Question";
    }
};

export const MultipleChoiceTab = ({ question, setHasAnswered, quizDependancies, isLightMode }: { question: QuestionFrontEndType, setHasAnswered: Function, quizDependancies?: QuizDependencyTypes, isLightMode: boolean }) => (
    <div>
        <Typography.Paragraph
            ellipsis={{
                rows: 2,
                expandable: true,
            }}
            className='divider-title'
        >
            <div className='question-title'>
                {question.qnsName}
            </div>
        </Typography.Paragraph>
        <div className={`tiny-${isLightMode ? "light" : "dark"}`}>
            {parse(question.description)}
        </div>
        {/* <MDEditor.Markdown warpperElement={{ "data-color-mode": isLightMode ? "light" : "dark" }} source={question.description} /> */}
        <br />
        <br />
        <Title level={3} className='divider-title'>Your answer</Title>
        <MultipleChoice options={question.choices} answers={question.answers as string[]} explanation={question.explanation} setHasAnswered={setHasAnswered} quizDependancies={quizDependancies} />
    </div>
);

const ShortAnswerTab = ({ question, setHasAnswered, isLightMode }: { question: QuestionFrontEndType, setHasAnswered: Function, isLightMode: boolean }) => (
    <div>
        <Typography.Paragraph
            ellipsis={{
                rows: 2,
                expandable: true,
            }}
            className='divider-title'
        >
            {question.qnsName}
        </Typography.Paragraph>
        <div className={`tiny-${isLightMode ? "light" : "dark"}`}>
            {parse(question.description)}
        </div>
        {/* <MDEditor.Markdown warpperElement={{ "data-color-mode": isLightMode ? "light" : "dark" }} source={question.description} /> */}
        <br />
        <br />
        <Title level={3} className='divider-title'>Your answer</Title>
        <ShortAnswer answer={question.answers as string} setHasAnswered={setHasAnswered} />
    </div>
);


const Header = ({ question }: { question: QuestionFrontEndType }) => (
    <div>
        {!onMobile() ?
            <Breadcrumb>
                <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to={`/courses/${question.courseId}/${pageList.currPage}`}>{question.courseId}</Link></Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Text
                        style={{ width: '20rem' }}
                        ellipsis
                    >
                        {question.qnsName}
                    </Text></Breadcrumb.Item>
            </Breadcrumb>
            :
            <Breadcrumb>
                <Breadcrumb.Item><Link to={`/courses/${question.courseId}/${pageList.currPage}`}><CaretLeftOutlined />{question.courseId}</Link></Breadcrumb.Item>
            </Breadcrumb>
        }
        <div className="title">
            <Title level={3} ellipsis>
                {question.courseId}&nbsp;
                {!onMobile() ?
                    <div className="subtitle">
                        &#8226; {question.topicName}
                    </div>
                    : null
                }
                <br />
                <Text type="secondary">
                    {GetUsername(question)} {!question.anon ? <DisplayBadges userId={question.userId} /> : null}
                </Text>
                <br />
                <Text type="secondary">
                    {GetRelativeTime(new Date(question.date).getTime())}
                </Text>
            </Title>

            <div className="icon-buttons">
                <div className="flex-child">
                    <Link to={`/courses/${question.courseId}/editQuestion`} state={{ editableQns: question }}><Button type="primary" shape="round" icon={<EditOutlined />}>Edit</Button></Link>
                </div>
                {/* <div className="flex-child">
                    <Button type="primary" shape="round" danger icon={<WarningFilled />}>Report</Button>
                </div> */}
            </div>
        </div>
    </div>
);

const getQuestionType = (question: QuestionFrontEndType, setHasAnswered: Function, isLightMode: boolean) => ({
    mc: <MultipleChoiceTab question={question} isLightMode={isLightMode} setHasAnswered={setHasAnswered} />,
    short: <ShortAnswerTab question={question} isLightMode={isLightMode} setHasAnswered={setHasAnswered} />
});

const QuestionType = ({ question, qnsType, setHasAnswered, isLightMode }: { question: QuestionFrontEndType, qnsType: keyof TypeOfQuestion, setHasAnswered: Function, isLightMode: boolean }) => <div>{getQuestionType(question, setHasAnswered, isLightMode)[qnsType]}</div>;

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
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTabKey, setActiveTabKey] = useState<string>(GetTabKey(searchParams.get("activeTab") ?? ""));
    const [hasAnswered, setHasAnswered] = useState<boolean>(false);
    const params = useParams();
    const qnsLink = params.qnsLink ?? '';
    const courseId = params.courseId ?? '';
    const { loading, question, hasRated, error } = GetQuestion(qnsLink);

    const queryClient = useQueryClient();

    const isLightMode = useContext(ThemeContext);

    useEffect(() => {

        // count view after 30 seconds
        const viewTimer = setTimeout(() => {
            fetch(
                `${process.env.REACT_APP_API_URI}/question/incrementView/${qnsLink}`, { method: "PUT" }

            ).then((result) => {
                if (result.ok) {
                    queryClient.invalidateQueries(["question", qnsLink]);
                }
            });
        }, 30000);

        return (() => {
            clearTimeout(viewTimer);
        });

    }, [qnsLink, queryClient]);

    if (loading) return <Loading />;

    if (error instanceof Error) return <ErrorMessage title={error.message} link={`/courses/${courseId}`} message="Go back to questions" />;
    if (question === undefined) return <ErrorMessage title="Could not find question" link={`/courses/${courseId}`} message="Go back to course" />;

    if (courseId !== question.courseId) return <ErrorMessage title="Could not find course" link="/" message="Home" />;

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
        searchParams.set("activeTab", key);
        setSearchParams(searchParams, { replace: true });
    };

    const contentList: Record<string, React.ReactNode> = {
        Question: <QuestionType question={question} qnsType={question.qnsType as keyof TypeOfQuestion} setHasAnswered={setHasAnswered} isLightMode={isLightMode} />,
        Discussion: <Discussion qnsLink={question.qnsLink} qnsDate={question.date} />,
        EditHistory: <EditHistory qnsLink={question.qnsLink} />
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
                <MathJax>
                    {contentList[activeTabKey]}
                </MathJax>
                {activeTabKey === "Question" && (hasAnswered || hasRated) ? <QuestionRater hasRated={hasRated} qnsLink={question.qnsLink} /> : null}
            </main>
        </Card>
    );
};

export default ApprovedQuestion;