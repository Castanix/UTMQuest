import { Button, Checkbox, Divider, Input, Space } from 'antd';
import React, { useState } from 'react';

import "./AddMultipleChoice.css";

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
                    <Checkbox key={`checkbox_${item._id}`} onChange={() => onCheckboxChange(index)} checked={options[index].isCorrect}>
                        <TextArea
                            className="add-mc-textarea"
                            key={`input_${item._id}`}
                            maxLength={1000}
                            onChange={e => updateOptionValue(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            defaultValue={options[index].value ?? ''}
                            autoSize
                        />
                    </Checkbox>
                )}
            </div>
        </div>
    );
};

export default AddMultipleChoice;