/* eslint-disable */

import { Avatar, BackTop, Breadcrumb, Button, Card, Divider, List, RadioChangeEvent, Select, Timeline, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";
import GetAllQuestions from "./fetch/GetAllQuestions";
import { GetProfile, UpdateProfile } from "./fetch/Profile";
import "./ProfilePage.css";

const { Text, Title } = Typography;
const { Item } = List;

export interface TimelineType {
        courseId: string,
        questionId: string,
        questionName: string, 
        date: string
}

const ProfilePage = () => {
    const [name, setName] = useState<string>("");
    const [colour, setColour] = useState<string>("");
    const [badges, setBadges] = useState<string[]>([]);
    const [timeline, setTimeline] = useState<TimelineType[]>();
    
    const { loadingProfile, errorProfile } = GetProfile("dummy22", setName, setColour, setBadges);
    const { loadingQuestions, errorQuestions } = GetAllQuestions("dummy22", setTimeline);

    if (loadingProfile) return <Loading />

    if (errorProfile) return <ErrorMessage title={errorProfile} link="." message="Refresh" />
    if (errorQuestions) return <ErrorMessage title={errorQuestions} link="." message="Refreshing" />

    const firstInitial = name[0][0];
    const lastInitial = name[name.length - 1][0];

    const Header = () => (
        <div>
            <Breadcrumb>
                <Breadcrumb.Item><Link to="/">← Back to Dashboard</Link></Breadcrumb.Item>
            </Breadcrumb>
            <Title level={3} ellipsis>Profile <div className="subtitle">&#8226; dummy22</div></Title>
        </div>
    );

    const toggleColorList = () => {
        document.querySelector('.color-list-container')?.classList.toggle('active');
    };

    const onColourSelect = (colour: string) => {
        UpdateProfile("dummy22", colour, setColour);
        toggleColorList();
    };


    // dataType to be determined (currently assuming tuple of [string, string])
    const loadTimeline = () => {
        // Should be added in order from newest to oldest
        const timelineArr: JSX.Element[] = [];

        if (timeline){
            timeline.forEach((item) => {
                timelineArr.push(<Timeline.Item label={item.date.substring(0, 10)}><Link to={`/courses/${item.courseId}/question/${item.questionId}`}>{item.questionName}</Link></Timeline.Item>);
            });
        };
        

        return timelineArr;
    };

    return (
        <Card title={<Header />}>
            <BackTop />
            <main className="main-container profile">
                <div className="profile-container">
                    <Button onClick={() => toggleColorList()}>Change Colour</Button>
                    <div className="color-list-container">
                        <List itemLayout="vertical" bordered>
                            <Item onClick={() => onColourSelect("gray")}>None</Item>
                            <Item onClick={() => onColourSelect("red")}>Red</Item>
                            <Item onClick={() => onColourSelect("orange")}>Orange</Item>
                            <Item onClick={() => onColourSelect("yellow")}>Yellow</Item>
                            <Item onClick={() => onColourSelect("green")}>Green</Item>
                            <Item onClick={() => onColourSelect("blue")}>Blue</Item>
                            <Item onClick={() => onColourSelect("indigo")}>Indigo</Item>
                            <Item onClick={() => onColourSelect("violet")}>Violet</Item>
                        </List>
                    </div>

                    <div className="user-container">
                        <Avatar 
                            size={160} 
                            style={{
                                backgroundColor: colour, 
                                fontSize: "2.5rem", 
                                border: "1px solid #f0f0f0"
                            }}
                        >
                            {firstInitial.concat(lastInitial)}
                        </Avatar>
                        <div className="user-details">
                            <Text strong>{name}</Text>
                        </div>
                    </div>
                    <div className="badge-container">
                        <Divider>Badges</Divider>
                        <div className="badges">
                            Reserved space for badges
                            {/* badges */}
                        </div>
                    </div>
                </div>
                <div className="timeline-container">
                    <Divider style={{fontSize: "1.75vw"}}>Activity Timeline</Divider>
                    {loadingQuestions ? 
                        <Loading /> :
                        <>
                            <Text strong>New</Text>
                            <Timeline mode="left" style={{marginTop: "2.75rem"}}>
                                {loadTimeline()}
                                {/* Once implemented, delete sample and use loadTimeline(data) to load from database */}
                                {/* <Timeline.Item label="2015-09-01">Create a services</Timeline.Item>
                                <Timeline.Item label="2015-09-01 09:12:11">Solve initial network problems</Timeline.Item>
                                <Timeline.Item>Technical testing</Timeline.Item>
                                <Timeline.Item label="2015-09-01 09:12:11">Network problems being solved</Timeline.Item> */}
                            </Timeline>
                            <Text strong>Old</Text>
                        </>}
                </div>
            </main>
        </Card>

    );
}

export default ProfilePage;