import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { BrowserRouter } from 'react-router-dom';
import { qnsTypeEnum, QuestionsType } from '../../backend/types/Questions';
import ApprovedQuestion from '../pages/ApprovedQuestion/ApprovedQuestion';

Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
})

const question: QuestionsType =
{
    _id: 'abc123',
    link: 'abcde',
    topicId: '123456',
    topicName: 'Arrays',
    courseId: 'test',
    qnsName: 'Arrays question',
    qnsType: qnsTypeEnum.mc,
    desc: 'description',
    xplan: 'new explanation',
    choices: ["Option A", "Option B"],
    ans: "Option A",
    authId: 'Bob',
    authName: 'Bob Bob',
    date: new Date().toString(),
    numDiscussions: 0,
    anon: false,
    latest: false
};


// mock add topic fetch call
const server = setupServer(
    rest.get(`${process.env.REACT_APP_API_URI}/question/oneQuestion/`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(question)
        )
    }),
    rest.get(`${process.env.REACT_APP_API_URI}/displayBadges/:utorid`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ displayBadges: [], longestLoginStreak: 1 })
        )
    })
);

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<ApprovedQuestion />, { wrapper: BrowserRouter });
    document = container;
});

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());


test('test mc question page', async () => {

    await waitFor(() => {
        expect(screen.getByText("Question")).toBeInTheDocument();
        expect(screen.getByText("Discussion")).toBeInTheDocument();
        expect(screen.getByText("Edit History")).toBeInTheDocument();

        expect(screen.queryByText("new explanation")).not.toBeInTheDocument();

        expect(screen.getByText("Problem")).toBeInTheDocument();
        expect(screen.getByText("Your answer")).toBeInTheDocument();

        expect(screen.getByText("Check Answers")).toBeInTheDocument();
        expect(screen.getByText("Reset")).toBeInTheDocument();
        expect(screen.getByText("Explanation")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Explanation"));

        expect(screen.getByText("new explanation")).toBeInTheDocument();
    });
});