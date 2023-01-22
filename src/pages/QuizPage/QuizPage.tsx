import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Card, Progress, Result, Space, Typography } from "antd";
import { Link, useParams } from 'react-router-dom';
import { red, green } from '@ant-design/colors';
import { MultipleChoiceTab } from '../ApprovedQuestion/ApprovedQuestion';
import { QuestionFrontEndType } from '../../../backend/types/Questions';

import "./QuizPage.css";
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { OptionType, initMC } from '../../components/MultipleChoice/MultipleChoiceState';
import { onMobile } from '../../components/EditHistory/EditHistory';

const { Text, Title } = Typography;

export type QuizDependencyTypes = {
    newOptionState?: OptionType[],
    setMCResult?: Function,
};

const Header = ({ courseId }: { courseId: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseId}`}>{courseId}</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Text>Quiz</Text></Breadcrumb.Item>
        </Breadcrumb>
        <div className="browse-question-title">
            <Title level={3} ellipsis>Quiz</Title>
        </div>
    </div>
);

const GenerateQuestions = (courseId: string) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [questions, setQuestions] = useState<QuestionFrontEndType[]>([]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/generateQuiz/${courseId}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                setQuestions(result);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [courseId]);

    return {
        loading,
        questions,
        error
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

    const { loading, questions, error } = GenerateQuestions(courseId ?? '');

    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link="#" message="Refresh" />;

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
                            <MultipleChoiceTab key={step} question={questions[step]} isLightMode={false} setHasAnswered={setHasAnswered} quizDependancies={{ newOptionState, setMCResult }} />
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
                                        <Link to={`/courses/${courseId}`}><Button>Back to questions</Button></Link>
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
                        <Link to={`/courses/${courseId}`}>
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