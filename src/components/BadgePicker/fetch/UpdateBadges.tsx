import { message } from "antd";

const UpdateBadge = (badgeSelected: string[], setBadgeSelected: Function, resetChanges: Function) => {
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

            return res.json();
        }).then(result => {
            setBadgeSelected(badgeSelected);
            message.success("Display Badges has been updated");

            // update session store for current user
            const userBadges = JSON.parse(sessionStorage.getItem("userBadges") ?? JSON.stringify({}));
            userBadges[result.utorid] = badgeSelected;

            sessionStorage.setItem("userBadges", JSON.stringify(userBadges));
        }).catch(err => {
            resetChanges();
            message.error(err.message);
        });
};

export default UpdateBadge;