import { Divider, Popover, Space } from "antd";
import React, { useEffect, useState } from "react";
import BadgeDescriptions from "../../BadgeDescriptions";

import "./DisplayBadges.css";

const DisplayBadges = ({ utorId }: { utorId: string }) => {
    const [badges, setBadges] = useState<string[]>([]);
    const [longestLoginStreak, setLongestLoginStreak] = useState<number>(1);

    useEffect(() => {

        const userBadges = JSON.parse(sessionStorage.getItem("userBadges") ?? JSON.stringify({}));

        if (utorId in userBadges) {
            setBadges(userBadges[utorId].displayBadges);
            setLongestLoginStreak(userBadges[utorId].longestLoginStreak);
        } else {
            fetch(`${process.env.REACT_APP_API_URI}/displayBadges/${utorId}`).then((response) => {
                if (!response.ok) throw new Error("Could not find badges for given user");
                return response.json();
            }).then((result) => {
                userBadges[utorId] = { displayBadges: result.displayBadges, longestLoginStreak: result.longestLoginStreak };
                sessionStorage.setItem("userBadges", JSON.stringify(userBadges));
                setBadges(result.displayBadges);
                setLongestLoginStreak(result.longestLoginStreak);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [utorId]);

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