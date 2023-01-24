import { Card, Divider, Timeline, Typography, Popover, Breadcrumb } from "antd";
import React, { ReactElement, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import BadgeDescriptions from "../../BadgeDescriptions";
import BadgePicker from "../../components/BadgePicker/BadgePicker";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Loading from "../../components/Loading/Loading";
import { UserContext } from "../../components/Topbar/Topbar";
import GetRelativeTime from "../../RelativeTime";
import { GetUserInitials } from "../QuestionsPage/QuestionsList";
import GetAllQuestions from "./fetch/GetAllQuestions";
import GetBadges from "./fetch/GetBadges";
import GetProfile from "./fetch/Profile";
import "./ProfilePage.css";
import { QuestionFrontEndType } from "../../../backend/types/Questions";

const { Text, Title } = Typography;

export interface TimelineType {
    courseId: string,
    qnsId: string,
    qnsLink: string,
    qnsName: string,
    date: string
}

export interface BadgesType {
    unlockedBadges: {
        addQns?: string | null,
        dailyLogin?: string | null,
        editQns?: string | null,
        threadReplies?: string | null,
        consecutivePosting?: string | null,
    },
    displayBadges: string[],
    longestLoginStreak: number
}

const Header = () => (
    <div>
        <Breadcrumb>
            <Breadcrumb.Item><Link to="/">Dashboard</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Text>Profile</Text></Breadcrumb.Item>
        </Breadcrumb>
        <Title level={3} ellipsis>Profile</Title>
    </div>
);

const ProfilePage = () => {

    const params = useParams();
    const userId = params.userId ?? "";
    const { userId: loggedInUser } = useContext(UserContext);

    const { loadingProfile, errorProfile, utorName } = GetProfile(userId);
    const { loadingBadges, errorBadges, badges } = GetBadges(userId);
    const { loadingQuestions, errorQuestions, data } = GetAllQuestions(userId);

    if (loadingProfile || loadingBadges || loadingQuestions) return <Loading />;

    if (errorProfile instanceof Error) return <ErrorMessage title={errorProfile.message} link="." message="Refresh" />;
    if (errorBadges instanceof Error) return <ErrorMessage title={errorBadges.message} link="." message="Refreshing" />;
    if (errorQuestions instanceof Error) return <ErrorMessage title={errorQuestions.message} link="." message="Refreshing" />;

    const sortedTimelineArr: TimelineType[] = [];

    data.forEach((question: QuestionFrontEndType) => {
        const { courseId, _id: qnsId, qnsLink, qnsName, date } = question;

        sortedTimelineArr.push({
            courseId,
            qnsId,
            qnsLink,
            qnsName,
            date
        });
    });

    sortedTimelineArr.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

    // TODO: need to include threadreplies when edit badge routes have been set
    const { addQns, editQns, consecutivePosting } = badges.unlockedBadges;
    const badgesSrc: string[] = [
        ...addQns ? [addQns] : ["addbadgelocked"],
        ...editQns ? [editQns] : ["editbadgelocked"],
        ...consecutivePosting ? [consecutivePosting] : ["consecutivebadgelocked"],
        "dailybadge"
    ];

    const loadTimeline = () => {
        const timelineArr: ReactElement[] = [];

        if (sortedTimelineArr) {
            sortedTimelineArr.forEach((item) => {
                timelineArr.push(
                    <Timeline.Item key={item.qnsId} label={GetRelativeTime(new Date(item.date).getTime())}>
                        <Link to={`/courses/${item.courseId}/question/${item.qnsLink}`}>
                            <Typography.Text className="timeline-link" ellipsis>{item.qnsName}</Typography.Text>
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
            if (badge !== "dailybadge") {
                badgeArr.push(
                    <Popover key={badge} content={BadgeDescriptions[badge as keyof typeof BadgeDescriptions]} trigger="hover">
                        <img src={`/images/${badge}.png`} alt={badge} />
                    </Popover>
                );
            }
        });

        return badgeArr;
    };

    return (
        <Card title={<Header />}>
            <main className="main-container profile">
                <div className="profile-container">
                    <div className="user-container">
                        <div className="avatar">
                            <p>{GetUserInitials(utorName)}</p>
                        </div>
                        <div className="user-details">
                            <Text strong>{utorName}</Text>
                            <div className="badge-under-name">
                                <Popover content={BadgeDescriptions.dailybadge} trigger="hover">
                                    <img src="/images/dailybadge.png" alt="dailybadge" />
                                </Popover>
                                <div>{badges.longestLoginStreak}</div>
                            </div>
                        </div>
                    </div>
                    <div className="badge-container">
                        {userId === loggedInUser ?
                            <BadgePicker badges={badges} />
                            :
                            null
                        }
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
                        <Timeline mode="left">
                            {loadTimeline()}
                        </Timeline>}
                    <Divider />
                </div>
            </main>
        </Card>

    );
};

export default ProfilePage;