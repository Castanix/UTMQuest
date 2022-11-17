/* eslint-disable */
import React, { ReactElement, ReactFragment, ReactHTML, ReactNode, useState } from "react";
import "./BadgePicker.css"
import { Modal, Button, message } from "antd";
import { BadgesType } from "../../pages/ProfilePage/ProfilePage";
import UpdateBadge from "./fetch/UpdateBadges";

const BadgePicker = ({badges, utorid}: {badges: BadgesType, utorid: string}) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [badgeSelected, setBadgeSelected] = useState<string[]>(badges.displayBadges);
    const [currBadgeSelected, setCurrBadgeSelected] = useState<string[]>(badgeSelected);
    const [changes, setChanges] = useState<string[]>([]);

    // data should be an array of img path names
    const initModal = () => {
        const imgArr: ReactElement[] = [];

        badges.unlockedBadges.forEach((item: string) => {
            if (badgeSelected.includes(item)) {
                imgArr.push(<img className="modal-img active" id={item} src={`/image/${item}.png`} onClick={() => handleSelect(item)} />);
            } else {
                imgArr.push(<img className="modal-img" id={item} src={`/image/${item}.png`} onClick={() => handleSelect(item)} />);
            }   
        });

        return imgArr;
    };

    const toggleActive = (id: string) => {
        const el = document.getElementById(id);
        if(el?.classList.contains('active')) {
            el.classList.remove('active');
        } else {
            el?.classList.add('active');
        }
    }

    const recordChange = (selected: string) => {
        if(changes.includes(selected)) {
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
        if(currBadgeSelected.includes(selected)) {
            setCurrBadgeSelected(currBadgeSelected.filter((item) => item !== selected));
            toggleActive(selected);
            recordChange(selected);
        } else {
            if(currBadgeSelected.length < 3) {
                setCurrBadgeSelected([...currBadgeSelected, selected]);
                toggleActive(selected);
                recordChange(selected);
            };
        };
    };

    const onCancel = () => {
        setShowModal(false);
        resetChanges();
        setChanges([]);

        setCurrBadgeSelected(badgeSelected);
    };

    const onOk = () => {
        setShowModal(false);

        if(changes.length > 0) {
            UpdateBadge(currBadgeSelected, utorid, setBadgeSelected, resetChanges);
        } else {
            message.error("No changes were made");
        };
        setChanges([]);
    };

    return (
        <>
            <Button shape="round" onClick={() => setShowModal(!showModal)}>Customize Badges</Button>
            <Modal open={showModal} onCancel={onCancel} onOk={onOk} >
                {initModal()}
            </Modal>
        </>
    )
};

export default BadgePicker;