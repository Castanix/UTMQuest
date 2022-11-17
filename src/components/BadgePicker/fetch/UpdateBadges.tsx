import { message } from "antd";

const UpdateBadge = (badgeSelected: string[], utorid: string, setBadgeSelected: Function, resetChanges: Function) => {
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
            body: JSON.stringify({ displayBadges: badgeSelected, utorid })
        }).then((res) => {
            if(!res.ok) throw new Error("Could not update displayed Badges");

            setBadgeSelected(badgeSelected);
            message.success("Display Badges has been updated");
        }).catch(err => {
            resetChanges();
            message.error(err.message);
        });
};

export default UpdateBadge;