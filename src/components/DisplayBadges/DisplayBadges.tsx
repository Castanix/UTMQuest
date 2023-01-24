import { Divider, Popover, Space } from "antd";
import React from "react";
import { useQuery } from "react-query";
import BadgeDescriptions from "../../BadgeDescriptions";

import "./DisplayBadges.css";

const fetchData = async (userId: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/displayBadges/${userId}`);
    if (!response.ok) throw new Error("Could not find badges for given user");
    return response.json();
};

const DisplayBadges = ({ userId }: { userId: string }) => {

    const { data } = useQuery(["userBadges", userId], () => fetchData(userId), { staleTime: Infinity });

    const badges: string[] = data ? data.displayBadges : [];
    const longestLoginStreak: number = data ? data.longestLoginStreak : 1;

    return (
        <span>
            {badges.length > 0 ?
                <Divider type="vertical" />
                : null
            }
            <Space split={<Divider type="vertical" />} size={2}>
                {
                    badges.map((item) => {
                        const path = `/images/${item}.png`;
                        return (
                            <Popover key={item} content={BadgeDescriptions[item as keyof typeof BadgeDescriptions]} trigger="hover">
                                <img className="badge" key={item} src={path} alt={item} /> {item === "dailybadge" ? longestLoginStreak : ""}
                            </Popover>
                        );
                    })
                }
            </Space>
        </span>
    );
};

export default DisplayBadges;