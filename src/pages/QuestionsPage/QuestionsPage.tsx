import { Breadcrumb, Button, Card, Space } from 'antd';
import Title from 'antd/es/typography/Title';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SettingTwoTone, StarFilled, StarOutlined } from '@ant-design/icons';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import GetAllTopics from '../ManageTopics/fetch/GetTopics';
import GetQuestions from './fetch/GetQuestions';
import QuestionsList from './QuestionsList';
import { CheckSaved, SaveCourse } from './fetch/SavedCourses';


const Header = ({ courseCode, favourite, setFavourite}:
    { courseCode: string, favourite: boolean, setFavourite: Function}) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><u>Dashboard</u></Link></Breadcrumb.Item>
            <Breadcrumb.Item>{courseCode}</Breadcrumb.Item>
            <Breadcrumb.Item>Browse Questions</Breadcrumb.Item>
        </Breadcrumb>
        <div className="browse-question-title">
            <Title level={3} ellipsis>{`Browse Questions for ${courseCode}`}</Title>
            <div>
                <Space>
                    <Link to={`/courses/${courseCode}/topics`}>
                        <Button type="primary" shape="round" icon={<SettingTwoTone />}>Manage Topics</Button>
                    </Link>
                    <Button
                        type={favourite ? "primary" : "default"}
                        icon={favourite ? <StarFilled /> : <StarOutlined style={{ color: "#1677FF" }} />}
                        shape="round"
                        onClick={() => {
                            SaveCourse(courseCode, favourite, setFavourite);
                        }}
                    />
                </Space>
            </div>
        </div>  
    </div>
);

const QuestionsPage = () => {
    const params = useParams();
    const courseCode = params.id;
    
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const { loadingSaved, errorSaved } = CheckSaved(courseCode ?? '', setIsSaved);

    const { loading: loadingTopics, topics, error: errorTopics } = GetAllTopics(courseCode ?? '');
    const { loading, questions, error } = GetQuestions(courseCode ?? '');

    if (loading || loadingTopics || loadingSaved) return <Loading />;

    if (error !== '' || errorTopics !== '' || errorSaved !== '') return <ErrorMessage title={error !== '' ? error : errorTopics} link="#" message="Refresh" />;
    return (
        <Card title={<Header courseCode={courseCode ?? ''} favourite={isSaved} setFavourite={setIsSaved} />} bordered={false}>
            <main className='main-container'>
                <QuestionsList questions={questions} topics={topics} courseCode={courseCode ?? ""} />
            </main>
        </Card>
    );
};

export default QuestionsPage;