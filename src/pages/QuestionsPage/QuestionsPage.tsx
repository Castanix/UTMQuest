import { Breadcrumb, Button, Card, Space, Typography } from 'antd';
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


const { Text } = Typography;

const Header = ({ courseCode, courseName, favourite, setFavourite}:
    { courseCode: string, courseName: string, favourite: boolean, setFavourite: Function}) => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Text>{courseCode}</Text></Breadcrumb.Item>
        </Breadcrumb>
        <div className="browse-question-title">
            <Title level={3} ellipsis>{`${courseCode} - ${courseName}`}</Title>
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
    const { loadingSaved, errorSaved, loadingCourse, errorCourse, courseName } = CheckSaved(courseCode ?? '', setIsSaved);

    const { loading: loadingTopics, topics, error: errorTopics } = GetAllTopics(courseCode ?? '');
    const { loading, questions, error } = GetQuestions(courseCode ?? '');

    if (loading || loadingTopics || loadingSaved || loadingCourse) return <Loading />;

    if (error !== '' || errorTopics !== '' || errorSaved !== '' || errorCourse !== '') return <ErrorMessage title={error !== '' ? error : errorTopics} link="#" message="Refresh" />;
    return (
        <Card title={<Header courseCode={courseCode ?? ''} courseName={courseName ?? ''} favourite={isSaved} setFavourite={setIsSaved} />} bordered={false}>
            <main className='main-container'>
                <QuestionsList questions={questions} topics={topics} courseCode={courseCode ?? ""} />
            </main>
        </Card>
    );
};

export default QuestionsPage;