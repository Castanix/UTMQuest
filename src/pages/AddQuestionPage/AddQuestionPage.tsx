import { Breadcrumb, Card, Steps, Typography } from 'antd';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import GetAllTopics from '../ManageTopics/fetch/GetTopics';
import "./AddQuestionPage.css";
import AQStepOne from './AQStepOne';
import AQStepTwo from './AQStepTwo';


const { Title } = Typography;

const Header = ({ courseCode }:
    { courseCode: string }) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><u>Dashboard</u></Link></Breadcrumb.Item>
            <Breadcrumb.Item>{courseCode}</Breadcrumb.Item>
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

    if (error !== '') return <ErrorMessage title={error} link={`/courses/${courseCode}`} message='Go back' />;

    return (
        <Card title={<Header courseCode={courseCode ?? ''} />} bordered={false}>
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