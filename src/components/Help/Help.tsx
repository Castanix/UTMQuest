import React, { useState } from 'react';
import { Button, Modal, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import "./Help.css";

const Help = ({ initial }: { initial: boolean }) => {
    const [isModalOpen, setIsModalOpen] = useState(initial);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <Button type='primary' shape='round' size='large' onClick={showModal} icon={<QuestionCircleOutlined />} className='help-btn' />
            <Modal title="Welcome to utmQuest" open={isModalOpen} className="help-modal" onCancel={handleClose} destroyOnClose footer={[
                <Button key="ok" type="primary" shape="round" onClick={() => handleClose()}>
                    Close
                </Button>
            ]}>
                <Typography.Paragraph>
                    <ul>
                        <li>This is a study tool designed for students that you can use to practice and review your course material.</li><br />
                        <li>This is a student-driven tool meaning that you and your fellow students can add questions to any course you want.</li><br />
                        <li>Other students can use these questions to prepare for an upcoming test or to review material as they go.</li><br />
                        <li>Everyone can also edit existing questions to fix any typos or make changes. </li><br />
                        <li>All the contributions you make, you can do so completely anonymously if you choose.</li><br />
                        <li>Lastly, check out your profile in the top right to see the badges you can earn with your contributions.</li><br />
                    </ul>
                    <Typography.Paragraph italic>The purpose of this app is to be able to build a useful resource of questions that is entirely driven by the student body.</Typography.Paragraph>
                </Typography.Paragraph>
            </Modal>
        </div>
    );
};

export default Help;