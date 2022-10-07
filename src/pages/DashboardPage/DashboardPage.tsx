import { Breadcrumb, Button, Card, List, Result, Table, Typography } from 'antd';
import { DropboxOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom';
import "./DashboardPage.css";
import { useState, useEffect } from 'react';
import Loading from '../../components/Loading/Loading';

const DashboardPage = () => {

    interface DataType {
        key: React.Key;
        courseCode: string;
        topic: string;
        qnsName: string;
        reviewStatus: string;
    }

    const { Title } = Typography;
    const { Column } = Table;

    const utorid = "dummy22";
    const [loading, setLoading] = useState<boolean>(true);
    const [courseData, setCourseData] = useState<[string, string][]>([]);
    const [reviewQnsData, setReviewQnsData] = useState<DataType[]>([]);
    const [error, setError] = useState("");


    const paginationConfig = (total:number, size:number) => {
        return {
            defaultCurrent: 1,
            total: total,
            pageSize: size
        }
    };


    const Header = () => (
        <div>
            <Breadcrumb>
                <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            </Breadcrumb>
            <Title level={3}>Dashboard</Title>
        </div>
    )


    const SavedCourses = () => {
        return courseData.length ? 
            <>
                <List
                    size="small"
                    bordered={false}
                    dataSource={courseData}
                    pagination={paginationConfig(courseData.length, 4)}
                    renderItem={item => 
                        <List.Item>
                            <Link to={item[0]}>
                                {item[1]}
                            </Link>
                        </List.Item>
                    }
                />
            </> : <div className="icon"><DropboxOutlined /></div>
    }
    

    const ReviewQuestions = () => {
        return reviewQnsData.length ? 
            <>
                <Table 
                    dataSource={reviewQnsData}
                    pagination={paginationConfig(reviewQnsData.length, 4)}
                >
                    <Column title="Question Name" dataIndex="qnsName" key="qnsName" />
                    <Column title="Topic" dataIndex="topic" key="topic" />
                    <Column title="Course Code" dataIndex="courseCode" key="courseCode" />
                    <Column title="Review Status" dataIndex="reviewStatus" key="reviewStatus" />
                </Table>
            </> : <div className="icon"><DropboxOutlined /></div>
    }

    useEffect(() => {
        const courseArr: [string, string][] = [];
        const qnsArr: DataType[] = [];

        const fetchData = async () => {
            await fetch(`/getAccount/${utorid}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();

            }).then((result) => {
                result.savedCourses.forEach((courseId: string) => {
                    courseArr.push([`/courses/${courseId}`, courseId]);
                });

                // TODO: create a type for qns
                result.reviewQns.forEach((qns: any) => {
                    qnsArr.push({
                        key: qns.qnsId,
                        courseCode: qns.qnsName,
                        topic: qns.topic,
                        qnsName: qns.qnsName,
                        reviewStatus: qns.reviewStatus + "/20"
                    });
                });

                setCourseData(courseArr);
                setReviewQnsData(qnsArr);
                setLoading(false);
            }).catch((err) => {
                setError(err.message);
                setLoading(false);
            });
        };

        fetchData();
        
    }, [setCourseData, setReviewQnsData, utorid]);


    if (loading) return <Loading />

    if (error !== "") {
        return (
            <Card bordered={false} className='error'>
                <Result title={error} extra={
                    <Link to="/"><Button type='primary'>Go back to login</Button></Link>}
                />
            </Card>
        )
    }

    return (
        <Card title={<Header />} bordered={false}>
            <div className="dashboard-content">

                <Card title="Saved Courses">
                    <div className="card-content">
                        <SavedCourses />
                    </div>
                </Card>

                <Card title="Questions Pending Review">
                    <div className="card-content">
                        <ReviewQuestions />
                    </div>
                </Card>
            </div>
        </Card>
    );
}

export default DashboardPage;