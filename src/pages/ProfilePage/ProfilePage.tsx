import { Avatar, Card, Divider, Timeline, Typography, Popover, Breadcrumb } from "antd";
import React, { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import BadgeDescriptions from "../../BadgeDescriptions";
import BadgePicker from "../../components/BadgePicker/BadgePicker";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";
import GetRelativeTime from "../../RelativeTime";
import GetAllQuestions from "./fetch/GetAllQuestions";
import GetBadges from "./fetch/GetBadges";
import { GetProfile } from "./fetch/Profile";
import "./ProfilePage.css";

const { Text, Title } = Typography;

export interface TimelineType {
    courseId: string,
    questionId: string,
    link: string,
    questionName: string,
    date: string
}

export interface BadgesType {
    unlockedBadges: {
        addQuestions?: string | null,
        editQuestions?: string | null,
        threadReplies?: string | null,
        consecutivePosting?: string | null,
        dailyLogin?: string | null,
    },
    displayBadges: string[]
}

const Header = () => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Profile</Breadcrumb.Item>
        </Breadcrumb>
        <Title level={3} ellipsis>Profile <div className="subtitle">&#8226; dummy22</div></Title>
    </div>
);

const ProfilePage = () => {
    const [name, setName] = useState<string>("");
    const [badges, setBadges] = useState<BadgesType>({ unlockedBadges: {}, displayBadges: [] });
    const [timeline, setTimeline] = useState<TimelineType[]>();

    const { loadingProfile, errorProfile } = GetProfile("dummy22", setName);
    const { loadingBadges, errorBadges } = GetBadges("dummy22", setBadges);
    const { loadingQuestions, errorQuestions } = GetAllQuestions("dummy22", setTimeline);

    if (loadingProfile || loadingBadges || loadingQuestions) return <Loading />;

    if (errorProfile) return <ErrorMessage title={errorProfile} link="." message="Refresh" />;
    if (errorBadges) return <ErrorMessage title={errorBadges} link="." message="Refreshing" />;
    if (errorQuestions) return <ErrorMessage title={errorQuestions} link="." message="Refreshing" />;


    const firstInitial = name[0][0].toUpperCase();
    const lastInitial = name[name.length - 1][0].toUpperCase();

    // TODO: need to include threadreplies when edit badge routes have been set
    const { addQuestions, editQuestions, consecutivePosting } = badges.unlockedBadges;
    const badgesSrc: string[] = [
        ...addQuestions ? [addQuestions] : ["addbadgelocked"],
        ...editQuestions ? [editQuestions] : ["editbadgelocked"],
        ...consecutivePosting ? [consecutivePosting] : ["consecutivebadgelocked"],
        "dailybadge"
    ];

    const loadTimeline = () => {
        const timelineArr: ReactElement[] = [];

        if (timeline) {
            timeline.forEach((item) => {
                timelineArr.push(
                    <Timeline.Item key={item.questionId} label={GetRelativeTime(new Date(item.date).getTime())}>
                        <Link to={`/courses/${item.courseId}/question/${item.link}`}>
                            <Typography.Link ellipsis>{item.questionName}</Typography.Link>
                        </Link>
                    </Timeline.Item>
                );
            });
        };
        return timelineArr;
    };

    const initBadges = () => {
        const badgeArr: ReactElement[] = [];

        badgesSrc.forEach(badge => {
            badgeArr.push(
                <Popover key={badge} content={BadgeDescriptions[badge as keyof typeof BadgeDescriptions]} trigger="hover">
                    <img src={`/images/${badge}.png`} alt={badge} />
                </Popover>
            );
        });

        return badgeArr;
    };

    return (
        <Card title={<Header />}>
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
                            {initBadges()}
                        </div>
                    </div>
                </div>
                <div className="timeline-container" style={{ height: "70vh", overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "gray lightgray" }}>
                    <Divider>Activity Timeline</Divider>
                    {loadingQuestions ?
                        <Loading /> :
                        <Timeline mode="left" style={{ marginTop: "2.75rem", marginInline: "auto", width: "100%" }}>
                            {loadTimeline()}
                        </Timeline>}
                    <Divider />
                </div>
            </main>
        </Card>

    );
};

export default ProfilePage;