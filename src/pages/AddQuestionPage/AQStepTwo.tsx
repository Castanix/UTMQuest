/* eslint-disable */

import { Button, Checkbox, Form, Input, Select } from 'antd';
import { Navigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { QuestionsType } from '../../../backend/types/Questions';
import qnsTypeEnum from './types/QnsTypeEnum';
import AddQuestion from './fetch/AddQuestion';
import AddMultipleChoice, { AddOptionType } from '../../components/MultipleChoice/AddMultipleChoice/AddMultipleChoice';
import DuplicateQuestions from '../../components/DuplicateQuestions/DuplicateQuestions';


const { Option } = Select;

const AQStepTwo = ({ courseCode, topicSelected, setCurrStep, edit }:
    { courseCode: string, topicSelected: [string, string], setCurrStep: Function, edit: boolean }) => {

    const [type, setType] = useState<qnsTypeEnum>();
    const [title, setTitle] = useState<string>();
    const [link, setLink] = useState<string>('');
    const [problemValue, setProblemValue] = useState<string>();
    const [explanationValue, setExplanationValue] = useState<string>();
    const [mcOption, setMcOption] = useState<AddOptionType[]>([{ _id: 1, value: "", isCorrect: false }, { _id: 2, value: "", isCorrect: false }]);
    const [solValue, setSolValue] = useState<string>();
    const [redirect, setRedirect] = useState<string>();
    const [isAnon, setAnon] = useState<boolean>(false);


    const { question, oldVersion } = useLocation().state ?? "";
    useEffect(() => {
        const setForm = () => {
            if(question) {
                const { link, qnsName, qnsType, desc, xplan, choices, ans } = question;
    
                setLink(link);
                setTitle(qnsName);
                setType(qnsType);
                setProblemValue(desc);
                setExplanationValue(xplan);
                if(typeof(ans) === "object") {
                    const mcArr: AddOptionType[] = [];
                    choices.forEach((choice: string, index: number) => {
                        mcArr.push({_id: index+1, value: choice, isCorrect: ans.includes(choice)});
                    });
                    setMcOption(mcArr);
                };
                if(typeof(ans) === "string") {
                    setSolValue(ans);
                };
            };
        }
        setForm();
    }, [question]);
    

    const setAnswerType = () => {
        let el: React.ReactNode;

        if (type === qnsTypeEnum.mc) {
            el = <AddMultipleChoice options={mcOption} setOptions={setMcOption} />;
        } else if (type === qnsTypeEnum.short) {
            el = <>
                <MDEditor
                    height={300}
                    value={solValue}
                    textareaProps={{ placeholder: "Add Solution", maxLength: 4000 }}
                    onChange={setSolValue}
                    highlightEnable={false}
                    previewOptions={{
                        rehypePlugins: [[rehypeSanitize]]
                    }}
                />
                <span className="editor-count">{(solValue ?? '').length} / 4000</span>
            </>;
        }

        return <Form.Item
            className='sol-container'
            style={type ? { display: "block" } : { display: "none" }}
            label="Solution"
            required
        >{el}</Form.Item>;
    };

    const verifySol = () => {
        if (type === qnsTypeEnum.mc) {
            let numCorrect = 0;
            let ret = true;

            mcOption.forEach((item) => {
                if (!item.value.trim()) {
                    ret = false;
                    return;
                };
                if (item.isCorrect) numCorrect += 1;
            });

            if (!ret) return false;

            if (numCorrect < 1) return false;

            return true;
        } if (type === qnsTypeEnum.short) {
            return !!solValue?.trim();
        }

        return false;
    };


    return (
        <>
            <h1>Topic: {topicSelected[1]}</h1>

            <Form
                className='question-form'
                labelAlign='left'
            >
                <div className="items-container">
                    <div className="answer-form">
                        <Form.Item name="title" label="Question Title" initialValue={question ? question.qnsName : ""} required>
                            <Input
                                placeholder='Add Question Title'
                                value={title}
                                maxLength={255}
                                showCount
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item name='type' label="Answer Type" initialValue={question ? question.qnsType : null} required>
                            <Select
                                placeholder="Select Type"
                                onChange={(value: qnsTypeEnum) => { setType((value === "mc") ? qnsTypeEnum.mc : qnsTypeEnum.short); }}
                                style={{ width: 'max(10rem, 10vw)' }}
                            >
                                <Option key='mc' value='mc'>Multiple Choice</Option>
                                <Option key='short' value='short'>Short Answer</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            {DuplicateQuestions(courseCode, topicSelected[0], (title ?? ''))}
                        </Form.Item>
                        <Form.Item label="Problem Description" required>
                            <MDEditor
                                height={300}
                                value={problemValue}
                                textareaProps={{ placeholder: "Add Problem", maxLength: 4000 }}
                                onChange={setProblemValue}
                                highlightEnable={false}
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]]
                                }}
                            />
                            <span className="editor-count">{(problemValue ?? '').length} / 4000</span>
                        </Form.Item>
                    </div>
                    <div className='detail-form'>
                        {setAnswerType()}
                        {type === qnsTypeEnum.mc
                            ?
                            <Form.Item label="Explanation (Optional)">
                                <MDEditor
                                    height={300}
                                    value={explanationValue}
                                    textareaProps={{ placeholder: "Add Explanation", maxLength: 4000 }}
                                    onChange={setExplanationValue}
                                    highlightEnable={false}
                                    previewOptions={{
                                        rehypePlugins: [[rehypeSanitize]]
                                    }}
                                />
                                <span className="editor-count">{(explanationValue ?? '').length} / 4000</span>
                            </Form.Item>
                            : null}
                    </div>
                </div>
            </Form>

            <div className='btn-container'>
                <Button onClick={() => setCurrStep()}>Back</Button>
                <div>
                    <Checkbox onChange={() => setAnon(!isAnon)}>Post Anonymously<br />(to other users only)</Checkbox>
                    <Button
                        type="primary"
                        disabled={!((type && (title ?? '').trim() && problemValue?.trim() && verifySol()))}
                        onClick={() => {
                            const choices: string[] = [];
                            let ans: string[] | string = solValue ?? '';

                            if (type === qnsTypeEnum.mc) {
                                const ansArr: string[] = [];

                                mcOption.forEach(item => {
                                    choices.push(item.value);
                                    if (item.isCorrect) ansArr.push(item.value);
                                });

                                ans = ansArr;
                            }

                            const questionObj: QuestionsType = {
                                _id: '',
                                link,
                                topicId: topicSelected[0],
                                topicName: topicSelected[1],
                                courseId: courseCode,
                                qnsName: (title ?? ''),
                                qnsType: type,
                                desc: problemValue ?? "",
                                xplan: explanationValue ?? "",
                                choices,
                                ans,
                                authId: "dummy22",
                                authName: !isAnon ? "Dummy Test" : "Anonymous",
                                date: '',
                                numDiscussions: 0,
                                anon: isAnon,
                                latest: true
                            };
                            AddQuestion(questionObj, setRedirect, edit, question, oldVersion);
                        }}
                    >Submit</Button>
                </div>
                {redirect ? <Navigate to={`/courses/${courseCode}/question/${redirect}`} /> : ""}
            </div>
        </>
    );
};

export default AQStepTwo;