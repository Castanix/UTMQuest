/* eslint-disable */

import { Breadcrumb, Card, Steps, Typography } from 'antd';
import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import GetQuestion from '../ApprovedQuestion/fetch/GetQuestion';
import GetAllTopics from '../ManageTopics/fetch/GetTopics';
import "./AddQuestionPage.css";
import AQStepOne from './AQStepOne';
import AQStepTwo from './AQStepTwo';


const { Title } = Typography;
const { Step } = Steps;

const Header = ({ courseCode }:
    { courseCode: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseCode}`}>{courseCode}</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Add a Question</Breadcrumb.Item>
        </Breadcrumb>
        <div className="title">
            <Title level={3} ellipsis>Add a Question <div className="subtitle">&#8226; {courseCode}</div></Title>
        </div>
    </div>
);

const AddQuestionPage = ({ edit }: { edit: boolean }) => {
    const [currStep, setCurrStep] = useState<number>(0);
    const [topicSelected, setTopicSelected] = useState<[string, string]>(["", ""]);

    const params = useParams();
    const courseCode = params.id;

    const { topics, loading, error } = GetAllTopics(courseCode ?? '');

    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link='/courses' message='Go back to courses' />;

    return (
        <Card title={<Header courseCode={courseCode ?? ''} />} bordered={false}>
            <main className='main-container'>
                <Steps current={currStep}>
                    <Step title={currStep ? "Done" : "Select a Topic"} />
                    <Step title="Add Question" />
                </Steps>
                <br />
                <div style={(currStep) ? { display: "none" } : { display: "block" }}>
                    <AQStepOne
                        courseCode={courseCode ?? ''}
                        topics={topics}
                        setCurrStep={setCurrStep}
                        setTopicSelected={setTopicSelected}
                    />
                </div>
                <div style={(currStep) ? { display: "block" } : { display: "none" }}>
                    <AQStepTwo courseCode={courseCode ?? ''} topicSelected={topicSelected} setCurrStep={setCurrStep} edit={edit} />
                </div>
            </main>
        </Card>
    );
};

export default AddQuestionPage;