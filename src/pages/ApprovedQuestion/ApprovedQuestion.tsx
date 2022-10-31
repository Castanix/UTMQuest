import React, { useState } from "react";
import './ApprovedQuestion.css'; 
import { Breadcrumb, Button, Card } from 'antd';
import { Link, useParams } from 'react-router-dom';
import Title from 'antd/lib/typography/Title';
import { EditTwoTone, WarningFilled } from "@ant-design/icons";
import MultipleChoice from "../../components/MultipleChoice/MultipleChoice";
import GetQuestions from "../QuestionsPage/fetch/GetQuestions";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { TypeOfQuestion, QuestionsType } from '../../../backend/types/Questions';
import ShortAnswer from "../../components/ShortAnswer/ShortAnswer";

const QuestionTab = ({options, answers, actualQuestion, explanation}: 
    {options: string[], answers: string[], actualQuestion: string, explanation: string}) => ( 
    <div> 
         <h3>{actualQuestion}</h3>
         <MultipleChoice options={options} answers={answers} explanation={explanation}/>
    </div>
);

const ShortAnswerTab = ({actualQuestion, explanation}: {actualQuestion: string, explanation: string}) => (
    <div> 
        <h3>{actualQuestion}</h3>
        <ShortAnswer explanation={explanation}/>
    </div>
);


const Header = ({ courseCode, courseTitle, approved, questionName, topicName }:
    { courseCode: string, courseTitle: string, approved: boolean, questionName: string, topicName: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/courses">Courses</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseCode}`}>{courseCode}</Link></Breadcrumb.Item>
            { approved ? 
                <Breadcrumb.Item><Link to={`/courses/${courseCode}/browse`}>Browse Questions</Link></Breadcrumb.Item> :
                <Breadcrumb.Item>Review Questions</Breadcrumb.Item> }
            <Breadcrumb.Item>{questionName}</Breadcrumb.Item>
        </Breadcrumb>
        <div className="title">
            <Title style={{marginTop: '15px'}} level={2} ellipsis>{courseTitle} · {topicName}</Title>
            <div className="icon-buttons"> 
                <div className="flex-child"> 
                    <Button type="link" icon={<EditTwoTone style={{ fontSize: '1.35rem', alignItems: 'center'}}/>} />
                    <p className="icon-text">Edit</p>
                </div>
                <div className="flex-child">
                    <Button type="link" danger icon={<WarningFilled style={{ fontSize: '1.35rem', alignItems: 'center'}}/>} />
                    <p className="icon-text report-text">Report</p>
                </div>
            </div>
        </div>
    </div>
);

const getQuestionType = (question: QuestionsType) => ({ 
    mc: <QuestionTab options={question.choices} answers={[question.ans]} actualQuestion={question.desc} explanation={question.xplan}/>,
    short: <ShortAnswerTab actualQuestion={question.desc} explanation={question.xplan}/>
});

const QuestionType = ({question, qnsType}: {question: QuestionsType, qnsType: keyof TypeOfQuestion}) => <div>{getQuestionType(question)[qnsType]}</div>;

const tabList = [
    {
        key: 'Question',
        tab: 'Question',
    },
    {
        key: 'Discussion',
        tab: 'Discussion',
    },
];    

const ApprovedQuestion = ({ approved }: { approved: boolean }) => {
    const [activeTabKey, setActiveTabKey] = useState<string>('Question'); 
    const params = useParams();
    const courseCode = params.courseId;
    const { loading, questions, error } = GetQuestions(courseCode ?? '', approved);

    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link="/courses" message="Go back to courses" />;

    const onTabChange = (key: string) => { 
        setActiveTabKey(key); 
    };

    const contentList: Record<string, React.ReactNode> =  { 
        Question:  <QuestionType question={questions[0]} qnsType={questions[0].qnsType as keyof TypeOfQuestion}/>,
        Solution: <p>Solution</p>, 
        Discussion: <p>Discussion</p>
    };

    return ( 
        <Card
            style={{width: '100%'}}
            title={<Header courseCode={courseCode ?? ''} courseTitle={`${courseCode} `} approved={approved} 
                questionName={questions[0].qnsName} topicName={questions[0].topicName} />}
            tabList={tabList}
            activeTabKey={activeTabKey}
            onTabChange={key => {
                onTabChange(key);
            }}    
        >
                {contentList[activeTabKey]}
        </Card>
    );
};

export default ApprovedQuestion;