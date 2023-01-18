import { Button, Checkbox, Form, Input, Select, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { Navigate, useLocation } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { QuestionsType } from '../../../backend/types/Questions';
import qnsTypeEnum from './types/QnsTypeEnum';
import AddQuestion from './fetch/AddQuestion';
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

const isRestore = (restorable: QuestionsType, newQuestion: QuestionsType) => {
    const { topicId, qnsName, desc, xplan, choices, ans } = restorable;
    const { topicId: topicId2, qnsName: qnsName2, desc: desc2, xplan: xplan2, choices: choices2, ans: ans2 } = newQuestion;

    return topicId === topicId2 && qnsName === qnsName2 && desc === desc2 && xplan === xplan2 && JSON.stringify(choices) === JSON.stringify(choices2) && ans === ans2;
};

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
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const { utorid, username } = useContext(UserContext);
    const isLightMode = useContext(ThemeContext);

    const { question, latest } = useLocation().state ?? "";

    useEffect(() => {
        const setForm = () => {
            if (question) {
                const { qnsName, qnsType, desc, xplan, choices, ans } = question;

                setLink(question.link);
                setTitle(qnsName);
                setType(qnsType);
                setProblemValue(desc);
                setExplanationValue(xplan);
                if (typeof (ans) === "object") {
                    const mcArr: AddOptionType[] = [];
                    choices.forEach((choice: string, index: number) => {
                        mcArr.push({ _id: index + 1, value: choice, isCorrect: ans.includes(choice) });
                    });
                    setMcOption(mcArr);
                };
                if (typeof (ans) === "string") {
                    setSolValue(ans);
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
                        {DuplicateQuestions(courseCode, topicSelected[0], title ?? '', question?.link)}
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
                            let ans: string[] | string = solValue ?? '';

                            if (type === qnsTypeEnum.mc) {
                                const ansArr: string[] = [];

                                mcOption.forEach(item => {
                                    choices.push(item.value);
                                    if (item.isCorrect) ansArr.push(item.value);
                                });

                                ans = ansArr;
                            }

                            const addableQuestion: QuestionsType = {
                                _id: question ? question._id : "",
                                link,
                                topicId: topicSelected[0],
                                topicName: topicSelected[1],
                                courseId: courseCode,
                                qnsName: (title?.trim() ?? ''),
                                qnsType: type,
                                desc: problemValue?.trim() ?? "",
                                xplan: explanationValue?.trim() ?? "",
                                choices,
                                ans,
                                authId: utorid,
                                authName: username,
                                date: latest ? question.date : new Date().toISOString(),
                                numDiscussions: question ? question.numDiscussions : 0,
                                anon: isAnon,
                                latest: true,
                                rating: question ? question.rating : {},
                                likes: question ? question.likes : 0,
                                dislikes: question ? question.dislikes : 0,
                                views: question ? question.views : 0,
                                viewers: question ? question.viewers : {}
                            };

                            AddQuestion(
                                addableQuestion,
                                setRedirect,
                                edit,
                                (latest || question),
                                setIsSubmit,
                                question ? isRestore(question, addableQuestion) : false
                            );
                        }}
                    >Submit</Button>
                </div>
                {redirect ? <Navigate to={`/courses/${courseCode}/question/${redirect}`} /> : ""}
            </div>
        </>
    );
};

export default AQStepTwo;