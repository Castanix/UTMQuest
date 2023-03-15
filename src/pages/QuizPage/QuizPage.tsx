import React, { useContext, useState } from 'react';
import { Breadcrumb, Button, Card, Progress, Result, Space, Typography } from "antd";
import { Link, useLocation, useParams } from 'react-router-dom';
import { red, green } from '@ant-design/colors';
import { useQuery } from 'react-query';
import { MultipleChoiceTab } from '../ApprovedQuestion/ApprovedQuestion';

import "./QuizPage.css";
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { OptionType, initMC } from '../../components/MultipleChoice/MultipleChoiceState';
import { onMobile } from '../../components/EditHistory/EditHistory';
import { ThemeContext } from '../../components/Topbar/Topbar';
import { pageList } from '../QuestionsPage/QuestionState';

const { Text, Title } = Typography;

export type QuizDependencyTypes = {
    newOptionState?: OptionType[],
    setMCResult?: Function,
};

type QuizFetchTypes = {
    courseId: string,
    topicsGen: string[],
    numQnsGen: number,
}

const Header = ({ courseId }: { courseId: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseId}/${pageList.currPage}`}>{courseId}</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Text>Quiz</Text></Breadcrumb.Item>
        </Breadcrumb>
        <div className="browse-question-title">
            <Title level={3} ellipsis>Quiz</Title>
        </div>
    </div>
);

const fetchGenerateQuiz = async (fetchParams: QuizFetchTypes) => {
    const { courseId, topicsGen, numQnsGen } = fetchParams;

    const response = await fetch(`${process.env.REACT_APP_API_URI}/question/generateQuiz/${courseId}/${JSON.stringify(topicsGen)}/${numQnsGen}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};


const GenerateQuestions = (fetchParams: QuizFetchTypes) => {
    const result = useQuery(["generateQuiz", fetchParams], () => fetchGenerateQuiz(fetchParams), { refetchOnWindowFocus: false });

    return {
        loading: result.isLoading,
        questions: result?.data,
        error: result.error
    };
};

const QuizPage = () => {
    const [step, setStep] = useState<number>(0);
    const [hasAnswered, setHasAnswered] = useState<boolean>(false);
    const [strokeColor, setStrokeColor] = useState<string[]>([]);
    const [mcResult, setMCResult] = useState<boolean>();
    const [newOptionState, setNewOptionState] = useState<OptionType[]>();
    const [numCorrect, setNumCorrect] = useState<number>(0);

    const params = useParams();
    const { courseId } = params;

    const isLightMode = useContext(ThemeContext);

    const { topicsGen, numQnsGen } = useLocation().state;

    const { loading, questions, error } = GenerateQuestions({ courseId: courseId ?? '', topicsGen, numQnsGen });

    if (loading) return <Loading />;

    if (error instanceof Error) return <ErrorMessage title={error.message} link="#" message="Refresh" />;

    const { length } = questions;
    if (questions.length) {
        if (step !== length) {
            const { choices: nextOptions, answers: nextAnswers } = questions[Math.min(step + 1, length - 1)];

            if (hasAnswered) {
                document.querySelector(".explanation-btn")?.classList.toggle("active", true);
            } else {
                document.querySelector(".explanation-btn")?.classList.toggle("active", false);
            };

            return (
                <Card title={<Header courseId={courseId ?? ''} />}>
                    <main className='main-container'>
                        <Space direction='vertical' size="large">
                            <Progress percent={Math.round(step / length * 100)} steps={length} strokeColor={strokeColor} />
                            <MultipleChoiceTab key={step} question={questions[step]} isLightMode={isLightMode} setHasAnswered={setHasAnswered} quizDependancies={{ newOptionState, setMCResult }} />
                            <Button disabled={!hasAnswered} onClick={() => {
                                setStep(step + 1);
                                setHasAnswered(false);
                                setStrokeColor([...strokeColor, mcResult ? green[6] : red[6]]);
                                setNumCorrect(mcResult ? numCorrect + 1 : numCorrect);
                                setNewOptionState(initMC(nextOptions, new Set<string>(nextAnswers)));
                            }}>Next</Button>
                        </Space>
                    </main>
                </Card>
            );
        };

        const grade = Math.round(numCorrect / length * 100);
        const numIncorrect = length - numCorrect;

        return (
            <Card title={<Header courseId={courseId ?? ''} />}>
                <main className='main-container'>
                    <div className='quiz-results'>
                        <Card title="Quiz Results">
                            <Space direction='vertical' size="middle">
                                <Progress percent={grade} success={{ percent: grade }} trailColor={red[6]} type="circle" />
                                <Text>Number of questions correct: {numCorrect}</Text>
                                <Text>Number of questions incorrect: {numIncorrect}</Text>
                                <div className='quiz-options'>
                                    <Space direction={onMobile() ? "vertical" : "horizontal"} size="middle">
                                        <Link to={`/courses/${courseId}/${pageList.currPage}`}><Button>Back to questions</Button></Link>
                                        <Button onClick={() => window.location.reload()}>Generate another quiz</Button>
                                    </Space>
                                </div>
                            </Space>
                        </Card>
                    </div>
                </main>
            </Card>
        );
    };

    return (
        <Card title={<Header courseId={courseId ?? ''} />}>
            <main className='main-container'>
                <Result
                    title="No Multiple Choice questions available."
                    extra={
                        <Link to={`/courses/${courseId}/${pageList.currPage}`}>
                            <Button type="primary">
                                Back to courses
                            </Button>
                        </Link>
                    }
                />
            </main>
        </Card>
    );
};

export default QuizPage;