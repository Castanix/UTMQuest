import { Button, Checkbox, Divider, Input, Space } from 'antd';
import React from 'react';

import "./AddMultipleChoice.css";

const { TextArea } = Input;

export interface AddOptionType {
    value: string;
    isCorrect: boolean;
}

const AddMultipleChoice = (
    { options, setOptions }:
        { options: AddOptionType[], setOptions: React.Dispatch<React.SetStateAction<AddOptionType[]>> }) => {

    const addOption = () => {
        const newOptions = [...options];

        const newOption: AddOptionType = {
            value: "",
            isCorrect: false
        };
        newOptions.push(newOption);
        setOptions(newOptions);
    };

    const updateOptionValue = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index].value = value;
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

    return (
        <div>
            <div className="add-mc-actions">
                <Divider orientation="left">Add choices below. Use the checkmark to mark options as correct</Divider>
                <Space split={<Divider type="vertical" />}>
                    <Button shape="round" className="mc-actions-add" onClick={addOption} disabled={options.length >= 5}>Add option</Button>
                    <Button shape="round" onClick={removeOption} disabled={options.length <= 2}>Remove option</Button>
                </Space>
            </div>
            <div className="add-mc">
                {options.map((item, index) =>
                    <Checkbox key={item.value.concat(index.toString())} onChange={() => onCheckboxChange(index)}>
                        <TextArea
                            className="add-mc-textarea"
                            key={item.value.concat(index.toString())}
                            maxLength={1000}
                            onChange={e => updateOptionValue(index, e.target.value)}
                            placeholder="Option goes here"
                            autoSize
                        />
                    </Checkbox>
                )}
            </div>
        </div>
    );
};

export default AddMultipleChoice;