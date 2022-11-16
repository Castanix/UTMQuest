import { Space } from "antd";
import React, { useEffect, useState } from "react";

import "./DisplayBadges.css";

const DisplayBadges = ({ utorid }: { utorid: string }) => {
    const [badges, setBadges] = useState<string[]>([]);

    useEffect(() => {

        const userBadges = JSON.parse(sessionStorage.getItem("userBadges") ?? JSON.stringify({}));

        if (utorid in userBadges) {
            setBadges(userBadges[utorid]);
        } else {
            fetch(`${process.env.REACT_APP_API_URI}/displayBadges/${utorid}`).then((response) => {
                if (!response.ok) throw new Error("Could not find badges for given user");
                return response.json();
            }).then((result) => {
                userBadges[utorid] = result;
                sessionStorage.setItem("userBadges", JSON.stringify(userBadges));
                setBadges(result);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [utorid]);

    return (
        <Space>
            {badges.map((item) => {
                const path = `/images/${item}.png`;
                return <img className="display-badges" key={item} src={path} alt={item} />;
            })}
        </Space>
    );
};

export default DisplayBadges;