import { Button, Checkbox, Form, Input, Modal, Select, Typography, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { Navigate, useLocation } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { QuestionFrontEndType } from '../../../backend/types/Questions';
import qnsTypeEnum from './types/QnsTypeEnum';
import { AddQuestion, EditQuestion, RestoreQuestion } from './fetch/AddQuestion';
import AddMultipleChoice, { AddOptionType } from '../../components/MultipleChoice/AddMultipleChoice/AddMultipleChoice';
import DuplicateQuestions from '../../components/DuplicateQuestions/DuplicateQuestions';
import { onMobile } from '../../components/EditHistory/EditHistory';
import { ThemeContext, UserContext } from '../../components/Topbar/Topbar';

const { Option } = Select;

const GetEditor = (value: string | undefined, placeholder: string, onChange: any, isLightMode: boolean) => {
    if (onMobile()) {
        return <TextArea className="add-question-textarea" rows={4} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} maxLength={4000} showCount />;
    }
    return (
        <div>
            <MDEditor
                height={300}
                value={value}
                textareaProps={{ placeholder, maxLength: 4000 }}
                onChange={onChange}
                highlightEnable={false}
                data-color-mode={isLightMode ? "light" : "dark"}
                previewOptions={{
                    rehypePlugins: [[rehypeSanitize]]
                }}
            />
            <span className="editor-count">{(value ?? "").length} / 4000</span>
        </div>
    );
};

// Checks if the question to be restored is not edited to be identical to current latest
const isIdenticalEdit = (obj1: QuestionFrontEndType, obj2: QuestionFrontEndType) => {
    // NOTE: Clone object to avoid mutating original!
    const keys = ['_id', 'anon', 'numDiscussions', 'utorName', 'utorId', 'date', 'latest'];
    const objClone1 = { ...obj1 };
    const objClone2 = { ...obj2 };

    keys.forEach(key => {
        delete objClone1[key as keyof QuestionFrontEndType];
        delete objClone2[key as keyof QuestionFrontEndType];
    });

    return JSON.stringify(objClone1) === JSON.stringify(objClone2);
};


// Checks if the question to be restored is not modified
const isRestore = (restorable: QuestionFrontEndType, newQuestion: QuestionFrontEndType) => {
    const { topicId, qnsName, description, explanation, choices, answers } = restorable;
    const { topicId: topicId2, qnsName: qnsName2, description: description2, explanation: explanation2, choices: choices2, answers: answers2 } = newQuestion;

    return topicId === topicId2 && qnsName === qnsName2 &&
        description === description2 && explanation === explanation2 &&
        JSON.stringify(choices) === JSON.stringify(choices2) && JSON.stringify(answers) === JSON.stringify(answers2);
};

const AQStepTwo = ({ courseId, topicSelected, setCurrStep }:
    { courseId: string, topicSelected: [string, string], setCurrStep: Function }) => {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [restoreQns, setRestoreQns] = useState<QuestionFrontEndType>();
    const [type, setType] = useState<qnsTypeEnum>();
    const [title, setTitle] = useState<string>();
    const [qnsLink, setQnsLink] = useState<string>('');
    const [problemValue, setProblemValue] = useState<string>();
    const [explanationValue, setExplanationValue] = useState<string>();
    const [mcOption, setMcOption] = useState<AddOptionType[]>([{ _id: 1, value: "", isCorrect: false }, { _id: 2, value: "", isCorrect: false }]);
    const [solValue, setSolValue] = useState<string>();
    const [redirect, setRedirect] = useState<string>();
    const [isAnon, setAnon] = useState<boolean>(false);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const { userId, username, anonId } = useContext(UserContext);
    const isLightMode = useContext(ThemeContext);

    const { question, latest } = useLocation().state ?? "";

    useEffect(() => {
        const setForm = () => {
            // if question exists, then it is an edit or restore
            if (question) {
                const { qnsName, qnsType, description, explanation, choices, answers } = question;

                setQnsLink(question.qnsLink);
                setTitle(qnsName);
                setType(qnsType);
                setProblemValue(description);
                setExplanationValue(explanation);
                if (typeof (answers) === "object") {
                    const mcArr: AddOptionType[] = [];
                    choices.forEach((choice: string, index: number) => {
                        mcArr.push({ _id: index + 1, value: choice, isCorrect: answers.includes(choice) });
                    });
                    setMcOption(mcArr);
                };
                if (typeof (answers) === "string") {
                    setSolValue(answers);
                };
            };
        };
        setForm();
    }, [question]);

    const setAnswerType = () => {
        let el: React.ReactNode;

        if (type === qnsTypeEnum.mc) {
            el = <AddMultipleChoice options={mcOption} setOptions={setMcOption} />;
        } else if (type === qnsTypeEnum.short) {
            el = <>
                {GetEditor(solValue, "Add Solution", setSolValue, isLightMode)}
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
            <Typography.Title ellipsis level={3}>Topic: {topicSelected[1]}</Typography.Title>

            <Form
                className='question-form'
                labelAlign='left'
                layout="vertical"
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
                    </div>
                    <Form.Item>
                        {DuplicateQuestions(courseId, topicSelected[0], title ?? '', question?.link)}
                    </Form.Item>
                    <div className="answer-form">
                        <Form.Item label="Problem Description" required>
                            {GetEditor(problemValue, "Add Problem", setProblemValue, isLightMode)}
                        </Form.Item>
                    </div>
                    <div className="detail-form">
                        {setAnswerType()}
                    </div>
                    <div>
                        {type === qnsTypeEnum.mc
                            ?
                            <Form.Item label="Explanation (Optional)">
                                {GetEditor(explanationValue, "Add Explanation", setExplanationValue, isLightMode)}
                            </Form.Item>
                            : null}
                    </div>
                </div>
            </Form>

            <div className='btn-container'>
                <Button shape="round" onClick={() => setCurrStep()}>Back</Button>
                <div className='submit-container'>
                    <div>
                        <Checkbox onChange={() => setAnon(!isAnon)}>Post Anonymously</Checkbox>
                        <Typography.Text><br />(to other users only)<br />(does not count toward badges)</Typography.Text>
                    </div>
                    <Button
                        type="primary"
                        shape="round"
                        disabled={!(type && (title ?? '').trim() && problemValue?.trim() && verifySol()) || isSubmit}
                        onClick={() => {
                            setIsSubmit(true);

                            const choices: string[] = [];
                            let answers: string[] | string = solValue ?? '';

                            if (type === qnsTypeEnum.mc) {
                                const ansArr: string[] = [];

                                mcOption.forEach(item => {
                                    choices.push(item.value);
                                    if (item.isCorrect) ansArr.push(item.value);
                                });

                                answers = ansArr;
                            }

                            const addableQns: QuestionFrontEndType = {
                                _id: question ? question._id : "",
                                qnsLink,
                                topicId: topicSelected[0],
                                topicName: topicSelected[1],
                                courseId,
                                qnsName: (title?.trim() ?? ''),
                                qnsType: type,
                                description: problemValue?.trim() ?? "",
                                explanation: explanationValue?.trim() ?? "",
                                choices,
                                answers,
                                userId,
                                anonId,
                                utorName: username,
                                date: latest ? question.date : new Date().toISOString(),
                                numDiscussions: question ? question.numDiscussions : 0,
                                anon: isAnon,
                                latest: true,
                                rating: question ? question.rating : {},
                                likes: question ? question.likes : 0,
                                dislikes: question ? question.dislikes : 0,
                                views: question ? question.views : 0,
                                viewers: question ? question.viewers : {},
                            };

                            if(question) {
                                if(latest && isRestore(question, addableQns)) {
                                    setRestoreQns(addableQns);
                                    setIsModalOpen(true);
                                } else {
                                    if(!isIdenticalEdit(addableQns, latest ?? question)) {
                                        EditQuestion(addableQns, setIsSubmit, setRedirect);
                                    } else {
                                        if(latest) {
                                            message.error("Changes are identical to the latest version");
                                        } else {
                                            message.error("No changes were made");
                                        };
                                        setIsSubmit(false);
                                    };
                                };
                            } else {
                                AddQuestion(addableQns, setRedirect, setIsSubmit);
                            };  
                        }}
                    >Submit</Button>
                </div>
                {redirect ? <Navigate to={`/courses/${courseId}/question/${redirect}`} /> : ""}
            </div>
            <Modal title="Restore Warning" 
                open={isModalOpen} 
                onOk={() => {
                    setIsModalOpen(false);
                    if(restoreQns) {
                        RestoreQuestion(restoreQns, setIsSubmit, setRedirect);
                    } else {
                        message.error("Unable to restore question");
                    };
                }}
                onCancel={() => {
                    setIsModalOpen(false);
                    setIsSubmit(false);
                }}
            >
                Restoring a question to a previous version without any changes will delete all subsequent versions
                and discussion posts associated with them.
                <br/>
                <b>Are you sure you would like to proceed?</b>
            </Modal>
        </>
    );
};

export default AQStepTwo;