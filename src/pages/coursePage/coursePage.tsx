import { Card, Breadcrumb, Button, Space, Typography } from 'antd';
import Icon, { SettingOutlined, StarOutlined, ContainerTwoTone, PlusCircleTwoTone, DiffTwoTone } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom';
import "./coursePage.css";

const { Title } = Typography;

const GetCard = ({ cardIcon, title }: { cardIcon: React.ForwardRefExoticComponent<any>, title: string }) => (
    <Card className='card' hoverable={true} bordered={false}>
        <Icon className='card-icon' component={cardIcon} /><br></br><br></br>
        <h2>{title}</h2>
    </Card>
)

const CoursePage = () => {

    // fetch the course here
    let params = useParams();
    const courseCode = params.id;
    const courseName = "Introduction to Computer Science"

    const Header = () => (
        <div>
            <Breadcrumb>
                <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to="/courses">Courses</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{courseCode}</Breadcrumb.Item>
            </Breadcrumb>
            <div className='title'>
                <Title level={3} ellipsis={true}>{courseName}</Title>
                <div>
                    <Space>
                        <Button type='primary' icon={<SettingOutlined />}>Manage Topics</Button>
                        <Button type='primary' icon={<StarOutlined />} />
                    </Space>
                </div>
            </div>
        </div>
    )

    return (
        <Card title={<Header />} bordered={false}>
            <div className='cards'>
                <GetCard cardIcon={ContainerTwoTone} title="Browse Questions" />
                <GetCard cardIcon={PlusCircleTwoTone} title="Add a Question" />
                <GetCard cardIcon={DiffTwoTone} title="Review Questions" />
            </div>
        </Card>
    );
}

export default CoursePage;