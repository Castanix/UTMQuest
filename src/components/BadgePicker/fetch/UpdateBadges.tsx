import { message } from "antd";
import { QueryClient } from "react-query";

const UpdateBadge = (badgeSelected: string[], userId: string, setBadgeSelected: Function, resetChanges: Function, queryClient: QueryClient) => {
    fetch(`${process.env.REACT_APP_API_URI}/badge/updateBadges`,
        {
            method: 'PUT',
            redirect: "follow",
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ displayBadges: badgeSelected })
        }).then((res) => {
            if (!res.ok) throw new Error("Could not update displayed Badges");

            setBadgeSelected(badgeSelected);
            message.success("Display Badges has been updated");

            // update session store for current user
            queryClient.invalidateQueries(["userBadges", userId]);
        }).catch(err => {
            resetChanges();
            message.error(err.message);
        });
};

export default UpdateBadge;