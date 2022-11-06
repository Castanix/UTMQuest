import React from 'react';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TopicsType from '../../backend/types/Topics';
import AQStepOne from '../pages/AddQuestionPage/AQStepOne';
import AQStepTwo from '../pages/AddQuestionPage/AQStepTwo';

Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
});


const req: TopicsType =  {
	_id: "abcd1234",
	topicName: "ABCD",
	course: "ABC123",
	numQuestions: 0
}

describe('AQStepOne', () => {
    let document: HTMLElement;

    beforeEach(() => {
        const Wrapper = () => {
            const [currStep, setCurrStep] = React.useState<number>(0)
            const [topicSelected, setTopicSelect] = React.useState<[string, string]>(["", ""])
            return <AQStepOne courseCode={"ABC123"} topics={[req]} setCurrStep={setCurrStep} setTopicSelected={setTopicSelect} />
        }
    
        const { container } = render(<Wrapper />, {wrapper: BrowserRouter});
        document = container;
    });
    
    
    test('check if part one of add question loads', () => {
        const info = screen.getByText(/If the topic you are trying to select does not exist, please add it here:/i);
        const label = screen.getByLabelText(/Select the topic this question is for/i);
    
        expect(info).toBeInTheDocument();
        expect(label).toBeInTheDocument();
    })
    
    test('check if part one of button enables', () => {
        expect(screen.getByText(/Next/i).parentElement).toBeDisabled();
    
        const combobox = screen.getByRole('combobox');
        fireEvent.mouseDown(combobox);
    
        fireEvent.click(screen.getByText('ABCD'));
    
        expect(screen.getByText(/Next/i).parentElement).toBeEnabled();
    })
})

describe('AQStepTwo', () => {
    let document: HTMLElement;

    beforeEach(() => {
        const Wrapper = () => {
            const [currStep, setCurrStep] = React.useState<number>(1)
            const [topicSelected, setTopicSelect] = React.useState<[string, string]>(["abcd1234", "ABCD"])
            return <AQStepTwo courseCode={"ABC123"} topicSelected={topicSelected} setCurrStep={setCurrStep} edit={false} />
        }
    
        const { container } = render(<Wrapper />, {wrapper: BrowserRouter});
        document = container;
    });
    
    
    test('check if part two of add question loads', () => {
        const topic = screen.getByText(/Topic: ABCD/i);
        const type = screen.getByTitle(/Answer Type/i);
    
        expect(topic).toBeInTheDocument();
        expect(type).toBeInTheDocument();
    })

    test('check if part two of solution appears', () => {
        expect(screen.getByTitle(/Solution/i)).not.toBeVisible();

        const combobox = screen.getByRole('combobox');
        fireEvent.mouseDown(combobox);
        fireEvent.click(screen.getByText(/Short Answer/i));
    
        expect(screen.getByTitle(/Solution/i)).toBeVisible();
        expect(screen.getByPlaceholderText(/Add Solution/i)).toBeInTheDocument();
    })

    test('check if part two of button enables', () => {
        expect(screen.getByText(/Submit/i).parentElement).toBeDisabled();

        const titleInput = screen.getByPlaceholderText(/Add Question Title/i);
        fireEvent.change(titleInput, {target: {value: "There is title"}});
        expect(screen.getByText(/Submit/i).parentElement).toBeDisabled();

        const combobox = screen.getByRole('combobox');
        fireEvent.mouseDown(combobox);
        fireEvent.click(screen.getByText(/Short Answer/i));
        const solInput = screen.getByPlaceholderText(/Add Solution/i);
        fireEvent.change(solInput, {target: {value: "There is solution"}});
        expect(screen.getByText(/Submit/i).parentElement).toBeDisabled();

        const problemInput = screen.getByPlaceholderText(/Add Problem/i);
        fireEvent.change(problemInput, {target: {value: "There is problem"}});

        expect(screen.getByText(/Submit/i).parentElement).toBeEnabled();
    })
})


