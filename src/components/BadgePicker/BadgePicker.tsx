/* eslint-disable */
import React, { ReactElement, useState } from "react";
import "./BadgePicker.css"
import { Modal, Button } from "antd";

const BadgePicker = () => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [badgeSelected, setBadgeSelected] = useState<string[]>([]);
    const [currBadgeSelected, setCurrBadgeSelected] = useState<string[]>(badgeSelected);
    const [changes, setChanges] = useState<string[]>([]);

    // Need to call a fetch to get all names of badges from db
    const dummyData = ["/image/image.png", "/image/image2.png", "/image/image3.png", "/image/image4.png"];

    // data should be an array of img path names
    const initModal = (data: string[]) => {
        const imgArr: ReactElement[] = [];

        data.forEach((item: string) => {
            imgArr.push(<img className="modal-img" id={item} src={item} onClick={() => handleSelect(item)} />);
        });

        return imgArr;
    };

    const recordChange = (selected: string) => {
        if(changes.includes(selected)) {
            setChanges(changes.filter((item) => item !== selected));
        } else {
            setChanges([...changes, selected]);
        }
    }

    const handleSelect = (selected: string) => {
        if(currBadgeSelected.includes(selected)) {
            setCurrBadgeSelected(currBadgeSelected.filter((item) => item !== selected));

            document.getElementById(selected)
                ?.classList.toggle('active');

            recordChange(selected);
        } else {
            if(currBadgeSelected.length < 3) {
                setCurrBadgeSelected([...currBadgeSelected, selected]);
                
                document.getElementById(selected)
                    ?.classList.toggle('active');

                recordChange(selected);
            };
        };
    };

    const onCancel = () => {
        setShowModal(false);

        changes.forEach(change => {
            document.getElementById(change)
                ?.classList.toggle('active');
        });
        setChanges([]);

        setCurrBadgeSelected(badgeSelected);
    };

    const onOk = () => {
        setShowModal(false);
        setChanges([]);
        setBadgeSelected(currBadgeSelected);
    };

    return (
        <>
            <Button shape="round" onClick={() => setShowModal(!showModal)}>Customize Badges</Button>
            <Modal open={showModal} onCancel={onCancel} onOk={onOk}>
                {initModal(dummyData)}
            </Modal>
        </>
    )
};

export default BadgePicker;