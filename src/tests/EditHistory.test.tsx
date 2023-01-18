import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { BrowserRouter } from 'react-router-dom';
import EditHistory from '../components/EditHistory/EditHistory';
import { qnsTypeEnum, QuestionsType } from '../../backend/types/Questions';

Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
})

const editHistory: QuestionsType[] = [
    {
        _id: 'abcde',
        link: 'abcde',
        topicId: '123456',
        topicName: 'Arrays',
        courseId: 'test',
        qnsName: 'Arrays question',
        qnsType: qnsTypeEnum.short,
        desc: 'description',
        xplan: 'none',
        choices: [],
        ans: 'answer goes here',
        authId: 'Bob',
        authName: 'Bob Bob',
        date: new Date().toString(),
        numDiscussions: 0,
        anon: false,
        latest: true,
        rating: {},
        likes: 0,
        dislikes: 0,
        views: 1,
        viewers: {}
    },
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
        choices: [],
        ans: '',
        authId: 'Bob',
        authName: 'Bob Bob',
        date: new Date().toString(),
        numDiscussions: 0,
        anon: false,
        latest: false,
        rating: {},
        likes: 0,
        dislikes: 0,
        views: 1,
        viewers: {}
    },
    {
        _id: 'abc',
        link: 'abcde',
        topicId: '123456',
        topicName: 'Arrays',
        courseId: 'test',
        qnsName: 'Arrays question',
        qnsType: qnsTypeEnum.mc,
        desc: 'description',
        xplan: 'none',
        choices: [],
        ans: '',
        authId: 'Bob',
        authName: 'Bob Bob',
        date: new Date().toString(),
        numDiscussions: 0,
        anon: false,
        latest: false,
        rating: {},
        likes: 0,
        dislikes: 0,
        views: 1,
        viewers: {}
    },
]

// mock add topic fetch call
const server = setupServer(
    rest.get(`${process.env.REACT_APP_API_URI}/question/editHistory/:link`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(editHistory)
        )
    }),
    rest.get(`${process.env.REACT_APP_API_URI}/displayBadges/:utorid`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ displayBadges: [], longestLoginStreak: 1 })
        )
    })
)

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<EditHistory link="abc123" />, { wrapper: BrowserRouter });
    document = container;
});

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());


test('test list content', async () => {

    await waitFor(() => {
        expect(document.getElementsByClassName('ant-list-item').length).toBe(3);

        expect(screen.getByText("Made changes to the Question type, Answer, and Explanation field(s)")).toBeInTheDocument();
        expect(screen.getByText("Made changes to the Explanation field(s)")).toBeInTheDocument();
        expect(screen.getByText("Made the original post.")).toBeInTheDocument();
    });
});

test('test view changes for first list item', async () => {

    await waitFor(() => {
        expect(document.getElementsByClassName('ant-list-item').length).toBe(3);

        fireEvent.click(screen.getAllByText("View Changes")[0]);

        expect(screen.getByText("Change Log")).toBeInTheDocument();

        expect(document.getElementsByClassName("new").length).toBe(3);

        expect(document.getElementsByClassName("old").length).toBe(3);
    })
})