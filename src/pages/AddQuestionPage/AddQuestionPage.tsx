import { Breadcrumb, Card, Steps, Typography } from 'antd';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import GetAllTopics from '../ManageTopics/fetch/GetTopics';
import "./AddQuestionPage.css";
import AQStepOne from './AQStepOne';
import AQStepTwo from './AQStepTwo';


const { Text, Title } = Typography;

const Header = ({ courseId }:
    { courseId: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to={`/courses/${courseId}`}>{courseId}</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Text>Add a Question</Text></Breadcrumb.Item>
        </Breadcrumb>
        <div className="title">
            <Title level={3} ellipsis>Add a Question <div className="subtitle">&#8226; {courseId}</div></Title>
        </div>
    </div>
);

const AddQuestionPage = () => {
    const [currStep, setCurrStep] = useState<number>(0);
    const [topicSelected, setTopicSelected] = useState<[string, string]>(["", ""]);

    const params = useParams();
    const { courseId } = params;

    const { topics, loading, error } = GetAllTopics(courseId ?? '');

    if (loading) return <Loading />;

    if (error !== '') return <ErrorMessage title={error} link={`/courses/${courseId}`} message='Go back' />;

    return (
        <Card title={<Header courseId={courseId ?? ''} />} bordered={false}>
            <main className='main-container'>
                <Steps current={currStep}
                    items={[
                        { title: currStep ? "Done" : "Select a Topic" },
                        { title: "Add Question" }
                    ]}
                />
                <br />
                <div style={(currStep) ? { display: "none" } : { display: "block" }}>
                    <AQStepOne
                        courseId={courseId ?? ''}
                        topics={topics}
                        setCurrStep={setCurrStep}
                        setTopicSelected={setTopicSelected}
                    />
                </div>
                <div style={(currStep) ? { display: "block" } : { display: "none" }}>
                    <AQStepTwo courseId={courseId ?? ''} topicSelected={topicSelected} setCurrStep={setCurrStep} />
                </div>
            </main>
        </Card>
    );
};

export default AddQuestionPage;