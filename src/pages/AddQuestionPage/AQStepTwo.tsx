/* eslint-disable */

// import MDEditor from '@uiw/react-md-editor';
import { Button, Checkbox, Form, Input, message, Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import React, { useState } from 'react';
import QuestionsType from '../../../backend/types/Questions';
import qnsTypeEnum from './types/QnsTypeEnum';
import qnsStatusType from './types/QnsStatusType';
import AddQuestion from './fetch/AddQuestion';
import AddMultipleChoice from '../../components/MultipleChoice/AddMultipleChoice/AddMultipleChoice';
import { AddOptionType } from '../../components/MultipleChoice/AddMultipleChoice/AddMultipleChoice';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';


/* installs:
npm i --save-dev @types/markdown-it --legacy-peer-deps
npm install markdown-it --save --legacy-peer-deps
npm install react-markdown-editor-lite --save --legacy-peer-deps
npm i react-markdown --legacy-peer-deps
*/

const AQStepTwo = ({ courseCode, topicSelected, setCurrStep }: 
    { courseCode: string, topicSelected: [string, string], setCurrStep: Function }) => {
        
    const [type, setType] = useState<qnsTypeEnum>();
    const [title, setTitle] = useState<string>('');
    const [problemValue, setProblemValue] = useState<string>();
    const [explanationValue, setExplanationValue] = useState<string>();
    const [mcOption, setMcOption] = useState<AddOptionType[]>([{_id: 1, value: "", isCorrect: false}, {_id: 2, value: "", isCorrect: false}]);
    const [solValue, setSolValue] = useState<string>();

    const setAnswerType = () => {
        let el = <></>

        if (type === qnsTypeEnum.mc) {
            el = <AddMultipleChoice options={mcOption} setOptions={setMcOption} />
        } else if (type === qnsTypeEnum.short) {
            el = <div><MDEditor
                    height={300} 
                    value={solValue} 
                    onChange={setSolValue}
                    highlightEnable={false}
                    previewOptions={{
                        rehypePlugins: [[rehypeSanitize]]
                    }}
                /></div>
            // el = <ReactQuill theme="snow" value={solValue} onChange={setSolValue} />
            // el = <SimpleMdeReact options={customRendererOptions} value={solValue} onChange={onChange} />
            // el = <MdEditor style={{ height: '500px' }} renderHTML={text => render(text)} />
        }

        return <Form.Item 
                    className='sol-container'
                    style={type ? {display: "block"} : {display: "none"}}
                    name='answer' 
                    label="Solution"
                    required
                >{el}</Form.Item>;
    }

    const verifySol = () => {
        if (type === qnsTypeEnum.mc) {
            let numCorrect = 0;
            let ret = true;

            mcOption.forEach((item) => {
                if(!item.value.trim()) {
                    ret = false;
                    return;
                }
                if(item.isCorrect) numCorrect = numCorrect + 1;
            });
            
            if (!ret) return false;

            if(numCorrect < 1) return false;

            return true;
        } else if (type === qnsTypeEnum.short) {
            return solValue?.trim() ? true : false
        }

        return false;
    }
    

    return (
        <>
            <h1>Topic: {topicSelected[1]}</h1>

            <Form 
                className='question-form'
                labelAlign='left'
            >
                <div className="items-container">
                    <div className="answer-form">
                        <Form.Item name="title" label="Question Title" required>
                            <Input
                                placeholder='Add Question Title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{width: 'max(16rem, 20vw)'}}
                            />
                        </Form.Item>

                        <Form.Item name='type' label="Answer Type" required>
                            <Select
                                placeholder="Select Type"
                                onChange={(value: qnsTypeEnum) => {setType((value === "mc") ? qnsTypeEnum.mc : qnsTypeEnum.short)}}
                                style={{width: 'max(10rem, 10vw)'}}
                            >
                                <Option key='mc' value='mc'>Multiple Choice</Option>
                                <Option key='short' value='short'>Short Answer</Option>
                            </Select>   
                        </Form.Item>
                        {setAnswerType()}
                    </div>
                    <div className="detail-form">
                        <Form.Item label="Problem Description" required>
                            <MDEditor 
                                height={300} 
                                value={problemValue} 
                                onChange={setProblemValue}
                                highlightEnable={false}
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]]
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="Explanation (Optional)">
                            <MDEditor 
                                height={300} 
                                value={explanationValue} 
                                onChange={setExplanationValue}
                                highlightEnable={false}
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]]
                                }}
                            />
                        </Form.Item>
                    </div>
                </div>
            </Form>

            <div className='btn-container'>
                <Button onClick={() => setCurrStep()}>Back</Button>
                <div>
                    <Checkbox>Post Anonymously<br/>(to other users only)</Checkbox>
                    <Button 
                        type={"primary"}
                        disabled={(type && title.trim() && problemValue?.trim() && verifySol()) ? false : true}
                        onClick={() => {
                            const questionObj: QuestionsType = {
                                _id: '',
                                topicId: topicSelected[0],
                                topicName: topicSelected[1],
                                courseId: courseCode,
                                qnsName: title,
                                qnsStatus: qnsStatusType.pending,
                                reviewStatus: 0,
                                qnsType: qnsTypeEnum.mc,
                                desc: problemValue ?? "",
                                xplan: explanationValue ?? "",
                                choices: ["N/A"],
                                ans: "not implemented yet",
                                authId: "dummy22",
                                authName: "Dummy Test",
                                date: '',
                                numDiscussions: 0,
                                snapshot: null,
                            }
                            AddQuestion(questionObj);
                        }}
                    >Submit</Button>
                </div> 
            </div>
        </>
    );
};

export default AQStepTwo;