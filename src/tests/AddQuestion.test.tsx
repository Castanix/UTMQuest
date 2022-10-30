import React from 'react';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import AddQuestion from '../pages/AddQuestionPage/AddQuestionPage';
import { AddOptionType } from '../components/MultipleChoice/AddMultipleChoice/AddMultipleChoice';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/lib/node';
import { rest } from 'msw';
import TopicsType from '../../backend/types/Topics';

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
	_id: "abc123",
	topicName: "ABC",
	course: "123",
	numApproved: 0,
	numPending: 0,
}

// mock add topic fetch call
const server = setupServer(
    rest.get(`${process.env.REACT_APP_API_URI}/getTopics/:courseId`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                { 
                    _id: "abc123",
                    topicName: "ABC",
                    course: "123",
                    numApproved: 0,
                    numPending: 0,
                }
            ])
        );
    }),
);

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<AddQuestion />, {wrapper: BrowserRouter});
    document = container;
});

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

test('check if first part of add question loads', () => {
    const info = screen.getByText(/If the topic you are trying to select does not exist/i);
    const label = screen.getByLabelText(/Select the topic this question is for/i);

    expect(info).toBeInTheDocument();
    expect(label).toBeInTheDocument();
})
