import React, { useContext, useState } from "react";
import './ApprovedQuestion.css';
import MDEditor from '@uiw/react-md-editor';
import { Breadcrumb, Button, Card, Typography } from 'antd';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CaretLeftOutlined, EditOutlined } from "@ant-design/icons";
import MultipleChoice from "../../components/MultipleChoice/MultipleChoice";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { TypeOfQuestion } from './types/QuestionTypes';
import { QuestionsType } from "../../../backend/types/Questions";
import ShortAnswer from "../../components/ShortAnswer/ShortAnswer";
import GetQuestion from "./fetch/GetQuestion";
import Discussion from "../../components/Discussion/Discussion";
import EditHistory, { GetUsername, onMobile } from "../../components/EditHistory/EditHistory";
import DisplayBadges from "../../components/DisplayBadges/DisplayBadges";
import GetRelativeTime from "../../RelativeTime";
import { ThemeContext } from "../../components/Topbar/Topbar";
import QuestionRater from "../../components/QuestionRater/QuestionRater";

const { Text, Title } = Typography;

const GetTabKey = (key: string) => {

    switch (key) {

        case "Question": return "Question";
        case "Discussion": return "Discussion";
        case "EditHistory": return "EditHistory";

        default: return "Question";
    }
};

const MultipleChoiceTab = ({ question, isLightMode, setHasAnswered }: { question: QuestionsType, isLightMode: boolean, setHasAnswered: Function }) => (
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
        <MDEditor.Markdown warpperElement={{ "data-color-mode": isLightMode ? "light" : "dark" }} source={question.desc} />
        <br />
        <br />
        <Title level={3} className='divider-title'>Your answer</Title>
        <MultipleChoice options={question.choices} answers={question.ans as string[]} explanation={question.xplan} setHasAnswered={setHasAnswered} />
    </div>
);

const ShortAnswerTab = ({ question, isLightMode, setHasAnswered }: { question: QuestionsType, isLightMode: boolean, setHasAnswered: Function }) => (
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
        <MDEditor.Markdown warpperElement={{ "data-color-mode": isLightMode ? "light" : "dark" }} source={question.desc} />
        <br />
        <br />
        <Title level={3} className='divider-title'>Your answer</Title>
        <ShortAnswer answer={question.ans as string} setHasAnswered={setHasAnswered} />
    </div>
);


const Header = ({ question }: { question: QuestionsType }) => (
    <div>
        {!onMobile() ?
            <Breadcrumb>
                <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to={`/courses/${question.courseId}`}>{question.courseId}</Link></Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Text
                        style={{ width: 100 }}
                        ellipsis
                    >
                        {question.qnsName}
                    </Text></Breadcrumb.Item>
            </Breadcrumb>
            :
            <Breadcrumb>
                <Breadcrumb.Item><Link to={`/courses/${question.courseId}`}><CaretLeftOutlined />{question.courseId}</Link></Breadcrumb.Item>
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
                    {GetUsername(question)} {!question.anon ? <DisplayBadges utorid={question.authId} /> : null}
                </Text>
                <br />
                <Text type="secondary">
                    {GetRelativeTime(new Date(question.date).getTime())}
                </Text>
            </Title>

            <div className="icon-buttons">
                <div className="flex-child">
                    <Link to={`/courses/${question.courseId}/editQuestion`} state={{ question }}><Button type="primary" shape="round" icon={<EditOutlined />}>Edit</Button></Link>
                </div>
                {/* <div className="flex-child">
                    <Button type="primary" shape="round" danger icon={<WarningFilled />}>Report</Button>
                </div> */}
            </div>
        </div>
    </div>
);

const getQuestionType = (question: QuestionsType, isLightMode: boolean, setHasAnswered: Function) => ({
    mc: <MultipleChoiceTab question={question} isLightMode={isLightMode} setHasAnswered={setHasAnswered} />,
    short: <ShortAnswerTab question={question} isLightMode={isLightMode} setHasAnswered={setHasAnswered} />
});

const QuestionType = ({ question, qnsType, isLightMode, setHasAnswered }: { question: QuestionsType, qnsType: keyof TypeOfQuestion, isLightMode: boolean, setHasAnswered: Function }) => <div>{getQuestionType(question, isLightMode, setHasAnswered)[qnsType]}</div>;

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
    const link = params.link ?? '';
    const courseCode = params.courseId ?? '';
    const { loading, question, hasRated, error } = GetQuestion(link);
    
    

    const isLightMode = useContext(ThemeContext);

    if (loading) return <Loading />;

    if (error !== '' || question === undefined) return <ErrorMessage title={error !== '' ? error : 'Could not find question'} link={`/courses/${courseCode}/browse`} message="Go back to questions" />;

    if (courseCode !== question.courseId) return <ErrorMessage title="Could not find course" link="/" message="Home" />;

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
        searchParams.set("activeTab", key);
        setSearchParams(searchParams, { replace: true });
    };

    const contentList: Record<string, React.ReactNode> = {
        Question: <QuestionType question={question} qnsType={question.qnsType as keyof TypeOfQuestion} isLightMode={isLightMode} setHasAnswered={setHasAnswered} />,
        Discussion: <Discussion questionLink={question.link} questionDate={question.date} />,
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
                {activeTabKey === "Question" && (hasAnswered || hasRated) ? <QuestionRater hasRated={hasRated} link={question.link} /> : null}
            </main>
        </Card>
    );
};

export default ApprovedQuestion;