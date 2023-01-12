import { Button, Checkbox, Divider, Input, List, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import dragula from 'react-dragula';

import "./AddMultipleChoice.css";
import "react-dragula/dist/dragula.css";
import { DragOutlined } from '@ant-design/icons';
import { onMobile } from '../../EditHistory/EditHistory';

const { TextArea } = Input;

export interface AddOptionType {
    _id: number;
    value: string;
    isCorrect: boolean;
}

/* options should have 2 items when calling this component */
const AddMultipleChoice = (
    { options, setOptions }:
        { options: AddOptionType[], setOptions: React.Dispatch<React.SetStateAction<AddOptionType[]>> }) => {

    const [key, setKey] = useState<number>(2);

    const addOption = () => {
        const newOptions = [...options];

        const newOption: AddOptionType = {
            _id: key + 1,
            value: "",
            isCorrect: false
        };
        newOptions.push(newOption);
        setOptions(newOptions);
        setKey(key + 1);
    };

    const updateOptionValue = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index].value = value.trim();
        setOptions(newOptions);
    };

    const onCheckboxChange = (index: number) => {
        const newOptionState = [...options];

        const item = newOptionState[index];
        newOptionState[index].isCorrect = !item.isCorrect;
        setOptions(newOptionState);
    };

    const removeOption = () => {
        const newOptions = [...options];
        newOptions.pop();
        setOptions(newOptions);
    };

    const getIndexInParent = (el: any) => Array.from(el.parentNode.children).indexOf(el);

    useEffect(() => {
        const handleReorder = (dragIndex: number, draggedIndex: number) => {
            setOptions((oldState) => {
              const newState = [...oldState];
              const item = newState.splice(dragIndex, 1)[0];
              newState.splice(draggedIndex, 0, item);
              return newState;
            });
        };

        let start: number;
        let end: number;
        const container = document.querySelector<HTMLElement>('.ant-list-items');

        if(container && !onMobile()) {
            const drake = dragula([container], {
                moves: (el: any) => {
                    start = getIndexInParent(el);
                    return true;
                },
            });

            drake.on('drop', (el: any) => {
                end = getIndexInParent(el);
                handleReorder(start, end);
            });
        }
    }, [setOptions]);

    return (
        <div>
            <div className="add-mc-actions">
                <Space direction="vertical">
                    <Divider orientation="left" className="mc-divider">Add choices below. Use the checkmark to mark options as correct</Divider>
                    <Typography.Text type="secondary" className="mc-subtitle">Option values must be unique (case-sensitive)</Typography.Text>
                    <Space split={<Divider type="vertical" />}>
                        <Button shape="round" className="mc-actions-add" onClick={addOption} disabled={options.length >= 5}>Add option</Button>
                        <Button shape="round" onClick={removeOption} disabled={options.length <= 2}>Remove option</Button>
                    </Space>
                </Space>
            </div>
            <div className="add-mc">
                <List 
                    bordered={false}
                    dataSource={options}
                    itemLayout="vertical"
                    renderItem={(item, index) =>
                        <Checkbox key={`checkbox_${item._id}`} onChange={() => onCheckboxChange(index)} checked={options[index].isCorrect}>
                            <Space>
                                <TextArea
                                    className="add-mc-textarea"
                                    key={`input_${item._id}`}
                                    maxLength={1000}
                                    onChange={e => updateOptionValue(index, e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                    defaultValue={options[index].value ?? ''}
                                    autoSize
                                />
                                <DragOutlined style={{display: onMobile() ? 'none' : 'static'}}/>
                            </Space>
                        </Checkbox>
                    }
                />
            </div>
        </div>
    );
};

export default AddMultipleChoice;