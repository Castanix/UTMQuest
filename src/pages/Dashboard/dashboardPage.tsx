import { Breadcrumb, Card, List, Space, Table, Tag, Typography } from 'antd';
import { DropboxOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom';
import "./dashboardPage.css";

const DashboardPage = () => {

    const { Title } = Typography;
    const { Column } = Table;
    // Grab SavedCourses and ReviewQuestions by utorid
    const courseData: any[] = ["Course 1", "Course 2", "Course 3", "Course 4", "Course 5"];

    interface DataType {
        key: React.Key;
        courseCode: string;
        topic: string;
        qnsName: string;
        reviewStatus: string;
      }
      
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
                            <Link to={''}>
                                {item}
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