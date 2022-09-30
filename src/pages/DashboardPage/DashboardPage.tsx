import { Breadcrumb, Button, Card, List, Result, Table, Typography } from 'antd';
import { DropboxOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom';
import "./DashboardPage.css";
import { useState } from 'react';
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

    const params = useParams();
    const utorid = params.id;
    const [loading, setLoading] = useState<boolean>(true);
    const [courseData, setCourseData] = useState<any[]>([]);
    // const [reviewQns, setReviewQns] = useState<any[]>([]);
    const [error, setError] = useState("");

    fetch(`/getAccount/${utorid}`)
        .then((res: Response) => {
            if (!res.ok) throw Error(res.statusText);
            return res.json();

        }).then((result) => {
            const courseArr: any[] = [];

            result.savedCourses.forEach((courseId: string) => {
                courseArr.push([`/courses/${courseId}`, courseId])
            })

            console.log(courseArr);
            setCourseData(courseArr);
            // setReviewQns(result.reviewQns);
            setLoading(false);
        }).catch((err) => {
            setError(err.message);
            setLoading(false);
        });

    const questionData: DataType[] = [
        {
            key: "1",
            courseCode: "CSC108",
            topic: "Strings",
            qnsName: "Hello Worldaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            reviewStatus: 5  + "/20"
        },
        {
            key: "2",
            courseCode: "CSC108",
            topic: "Strings",
            qnsName: "Hello World",
            reviewStatus: 5  + "/20"
        },
        {
            key: "3",
            courseCode: "CSC108",
            topic: "Strings",
            qnsName: "Hello World",
            reviewStatus: 5  + "/20"
        },
        {
            key: "4",
            courseCode: "CSC108",
            topic: "Strings",
            qnsName: "Hello World",
            reviewStatus: 5  + "/20"
        },
        {
            key: "5",
            courseCode: "CSC108",
            topic: "Strings",
            qnsName: "Hello World",
            reviewStatus: 5  + "/20"
        }
    ];

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
        return questionData.length ? 
            <>
                <Table 
                    dataSource={questionData}
                    pagination={paginationConfig(questionData.length, 4)}
                >
                    <Column title="Course Code" dataIndex="courseCode" key="courseCode" />
                    <Column title="Topic" dataIndex="topic" key="topic" />
                    <Column title="Question Name" dataIndex="qnsName" key="qnsName" />
                    <Column title="Review Status" dataIndex="reviewStatus" key="reviewStatus" />
                </Table>
            </> : <div className="icon"><DropboxOutlined /></div>
    }


    if (loading) return <Loading />

    if (error !== "") {
        return (
            <Card bordered={false} className='error'>
                <Result title={error} extra={
                    <Link to="/courses"><Button type='primary'>Go back to login</Button></Link>}
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