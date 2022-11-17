/* eslint-disable */

import { Avatar, BackTop, Card, Divider, Timeline, Typography, PageHeader, Popover, Button } from "antd";
import { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import BadgePicker from "../../components/BadgePicker/BadgePicker";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";
import GetAllQuestions from "./fetch/GetAllQuestions";
import GetBadges from "./fetch/GetBadges";
import { GetProfile } from "./fetch/Profile";
import "./ProfilePage.css";

const { Text, Title } = Typography;

export interface TimelineType {
        courseId: string,
        questionId: string,
        questionName: string, 
        date: string
}

export interface BadgesType {
    unlockedBadges: string[],
    displayBadges: string[]
}

const ProfilePage = () => {
    const [name, setName] = useState<string>("");
    const [badges, setBadges] = useState<BadgesType>({unlockedBadges: [], displayBadges: []});
    const [timeline, setTimeline] = useState<TimelineType[]>();
    
    const { loadingProfile, errorProfile } = GetProfile("dummy22", setName);
    const { loadingBadges, errorBadges } = GetBadges("dummy22", setBadges);
    const { loadingQuestions, errorQuestions } = GetAllQuestions("dummy22", setTimeline);

    if (loadingProfile || loadingBadges || loadingQuestions) return <Loading />

    if (errorProfile) return <ErrorMessage title={errorProfile} link="." message="Refresh" />
    if (errorBadges) return <ErrorMessage title={errorBadges} link="." message="Refreshing" />
    if (errorQuestions) return <ErrorMessage title={errorQuestions} link="." message="Refreshing" />
    

    const firstInitial = name[0][0].toUpperCase();
    const lastInitial = name[name.length - 1][0].toUpperCase();
    const badgesSrc: string[]= ["/image/image.png", "/image/image2.png", "/image/image3.png", "/image/image4.png"]
    console.log(badges);


    const Header = () => (
        <div>
            <PageHeader
                className="profile-header"
                onBack={() => window.history.back()}
                title="Go back"
            />
            <Title level={3} ellipsis>Profile <div className="subtitle">&#8226; dummy22</div></Title>
        </div>
    );

    // dataType to be determined (currently assuming tuple of [string, string])
    const loadTimeline = () => {
        // Should be added in order from newest to oldest
        const timelineArr: JSX.Element[] = [];

        if (timeline){
            timeline.forEach((item) => {
                timelineArr.push(<Timeline.Item key={item.questionId} label={new Date(item.date).toDateString()}><Link to={`/courses/${item.courseId}/question/${item.questionId}`}>{item.questionName}</Link></Timeline.Item>);
            });
        };
        return timelineArr;
    };

    const initBadges = () => {
        const badgeArr: ReactElement[] = [];

        // We need to change the content to its respective requirements
        badgesSrc.forEach(badge => {
            badgeArr.push(
                <Popover content="Post 5 Questions (1/5)" trigger="hover">
                    <img src={badge} />
                </Popover>
            );
        });

        return badgeArr;
    };

    return (
        <Card title={<Header />}>
            <BackTop />
            <main className="main-container profile">
                <div className="profile-container">
                    <div className="user-container">   
                            <Avatar className="avatar" size={160}>
                                {firstInitial.concat(lastInitial)}
                            </Avatar>
                        <div className="user-details">
                            <Text strong>{name}</Text>
                        </div>
                    </div>
                    <div className="badge-container">
                        <BadgePicker badges={badges} utorid="dummy22" />
                        <Divider>Badges</Divider>
                        <div className="badges">

                            {/* These are dummy badges, may want to consider creating a function to populate badges section instead of manual additions */}
                            {initBadges()}
                        </div>
                    </div>
                </div>
                <div className="timeline-container" style={{height: "70vh", overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "gray lightgray"}}>
                    <Divider>Activity Timeline</Divider>
                    {loadingQuestions ? 
                        <Loading /> :
                        <>
                            <Timeline mode="left" style={{marginTop: "2.75rem", width: "40vw"}}>
                                {loadTimeline()}
                            </Timeline>
                        </>}
                    <Divider></Divider>
                </div>
            </main>
        </Card>

    );
}

export default ProfilePage;