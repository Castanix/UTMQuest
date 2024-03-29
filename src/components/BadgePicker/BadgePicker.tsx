import React, { ReactElement, useContext, useState } from "react";
import "./BadgePicker.css";
import { Modal, Button, message } from "antd";
import { BadgesType } from "../../pages/ProfilePage/ProfilePage";
import UpdateBadge from "./fetch/UpdateBadges";
import { UserContext } from "../Topbar/Topbar";

const BadgePicker = ({ badges }: { badges: BadgesType }) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [badgeSelected, setBadgeSelected] = useState<string[]>(badges.displayBadges);
    const [currBadgeSelected, setCurrBadgeSelected] = useState<string[]>(badgeSelected);
    const [changes, setChanges] = useState<string[]>([]);

    const { utorid } = useContext(UserContext);

    // Toggles the green border around an image depending on selection
    const toggleActive = (id: string) => {
        const el = document.getElementById(id);
        if (el?.classList.contains("img-active")) {
            el.classList.remove("img-active");
        } else {
            el?.classList.add("img-active");
        }
    };

    // Records any changes to currBadgeSelected for resetting
    const recordChange = (selected: string) => {
        if (changes.includes(selected)) {
            setChanges(changes.filter((item) => item !== selected));
        } else {
            setChanges([...changes, selected]);
        };
    };

    const resetChanges = () => {
        changes.forEach(change => {
            toggleActive(change);
        });
    };

    const handleSelect = (selected: string) => {
        if (currBadgeSelected.includes(selected)) {
            setCurrBadgeSelected(currBadgeSelected.filter((item) => item !== selected));
            toggleActive(selected);
            recordChange(selected);
        } else {
            if (currBadgeSelected.length < 3) {
                setCurrBadgeSelected([...currBadgeSelected, selected]);
                toggleActive(selected);
                recordChange(selected);
            };
        };
    };

    const initModal = () => {
        const imgArr: ReactElement[] = [];

        Object.values(badges.unlockedBadges).forEach((item: string | null) => {
            if (item) {
                if (badgeSelected.includes(item)) {
                    imgArr.push(<img className="modal-img img-active" id={item} key={item} src={`/images/${item}.png`} alt="badge display icon" onClick={() => handleSelect(item)} />);
                } else {
                    imgArr.push(<img className="modal-img" id={item} key={item} src={`/images/${item}.png`} alt="badge display icon" onClick={() => handleSelect(item)} />);
                }
            }
        });

        return imgArr;
    };

    const onCancel = () => {
        setShowModal(false);
        resetChanges();
        setChanges([]);

        setCurrBadgeSelected(badgeSelected);
    };

    const onOk = () => {
        setShowModal(false);

        if (changes.length > 0) {
            UpdateBadge(currBadgeSelected, utorid, setBadgeSelected, resetChanges, badges.longestLoginStreak);
        } else {
            message.error("No changes were made");
        };
        setChanges([]);
    };

    return (
        <>
            <Button shape="round" onClick={() => setShowModal(!showModal)}>Customize Badges</Button>
            <Modal title="Select up to 3 Badges to be Displayed." open={showModal} onCancel={onCancel}
                footer={[
                    <Button key="cancel" shape="round" onClick={() => onCancel()}>
                        Cancel
                    </Button>,
                    <Button key="ok" type="primary" shape="round" onClick={() => onOk()}>
                        OK
                    </Button>
                ]}>
                <div>Selected {currBadgeSelected.length}/3</div>
                <br />
                {initModal()}
            </Modal>
        </>
    );
};

export default BadgePicker;