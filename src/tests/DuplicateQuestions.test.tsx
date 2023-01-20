import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import DuplicateQuestions, { DuplicateQuestionType } from '../components/DuplicateQuestions/DuplicateQuestions';
import { BrowserRouter } from 'react-router-dom';

Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
})

const duplicateQuestions: DuplicateQuestionType[] = [
    {
        description: "123",
        highlights: [{ score: 2, path: "qnsName", texts: [{ value: "Strings ", type: "text" }, { value: "question", type: "hit" }] }],
        qnsLink: "abc123",
        qnsName: "Strings question",
        score: 2.5,
        _id: "1234"
    },
    {
        description: "bad question",
        highlights: [],
        qnsLink: "abc1234",
        qnsName: "empty question",
        score: 1,
        _id: "12345"
    }
]

// mock add topic fetch call
const server = setupServer(
    rest.get(`${process.env.REACT_APP_API_URI}/question/similar/:topicId/:originalQuestionId/:searchTerm`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(duplicateQuestions)
        )
    }),
)

let document: HTMLElement;

beforeEach(() => {
    const Wrapper = () => {
        return DuplicateQuestions("course123", "topic123", "question", "abc123")
    };
    const { container } = render(<Wrapper />, { wrapper: BrowserRouter });
    document = container;
});

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());


test('test list content', async () => {

    await waitFor(() => {
        expect(document.querySelectorAll('li').length).toBe(1);
        expect(screen.getByText(/Strings question/i)).toBeInTheDocument();
    });
});