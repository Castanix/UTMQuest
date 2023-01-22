import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import Discussion from '../components/Discussion/Discussion';
import { DiscussionFrontEndType } from "../../backend/types/Discussion";
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../components/Topbar/Topbar';


Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
})

const topLevelComments: DiscussionFrontEndType[] = [
    {
        _id: "123",
        qnsLink: "abc",
        op: true,
        utorName: 'Dummy Test',
        userId: "123",
        anonId: "1",
        content: 'First comment',
        thread: ["childComment"],
        date: new Date().toString(),
        deleted: false,
        anon: false,
        edited: false
    },
    {
        _id: "1234",
        qnsLink: "abc",
        op: true,
        utorName: 'Dummy Test',
        userId: "123",
        anonId: "1",
        content: 'Second comment',
        thread: [],
        date: new Date().toString(),
        deleted: false,
        anon: false,
        edited: false
    },
    {
        _id: "12345",
        qnsLink: "abc",
        op: true,
        utorName: 'Dummy Test',
        userId: "123",
        anonId: "1",
        content: 'Third comment',
        thread: [],
        date: new Date().toString(),
        deleted: false,
        anon: false,
        edited: false
    }
]

const childComment: DiscussionFrontEndType = {
    _id: "childComment",
    qnsLink: "abc",
    op: false,
    utorName: 'Dummy Test',
    userId: "123",
    anonId: "1",
    content: 'Inner comment',
    thread: [],
    date: new Date().toString(),
    deleted: false,
    anon: true,
    edited: false
}

const deletedComment: DiscussionFrontEndType = {
    _id: "123",
    qnsLink: "abc",
    op: true,
    utorName: 'Dummy Test',
    userId: "123",
    anonId: "1",
    content: 'This message was deleted by the original author or a moderator',
    thread: ["childComment"],
    date: new Date().toString(),
    deleted: true,
    anon: false,
    edited: false
}

// mock add topic fetch call
const server = setupServer(
    rest.get(`${process.env.REACT_APP_API_URI}/discussion/thread/:qnsLink`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ discussion: topLevelComments })
        )
    }),
    rest.get(`${process.env.REACT_APP_API_URI}/discussion/allThreads/:qnsLink`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([childComment])
        )
    }),
    rest.delete(`${process.env.REACT_APP_API_URI}/discussion/:discussionId`, (req, res, ctx) => {
        return res(
            ctx.status(202),
            ctx.json({ ...deletedComment })
        )
    }),
    rest.post(`${process.env.REACT_APP_API_URI}/discussion`, (req, res, ctx) => {
        return res(
            ctx.status(201),
            ctx.json({ authorized: true, insertedId: 'abcd' })
        )
    }),
);

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<UserContext.Provider value={{ username: "Bob", userId: "123", anonId: "1" }}><Discussion qnsLink="abc" qnsDate="some date" /></UserContext.Provider>, { wrapper: BrowserRouter })
    document = container;
});

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());


test('test loading 3 top level comments content', async () => {
    await waitFor(() => {
        expect(screen.getByText(/First comment/i)).toBeInTheDocument();
        expect(screen.getByText(/Second comment/i)).toBeInTheDocument();
        expect(screen.getByText(/Third comment/i)).toBeInTheDocument();

        // should contain 4 elements (3 user comments + 1 comment editor)
        expect(document.getElementsByClassName('ant-comment').length).toBe(4);
    });
});

test('test expanding a thread', async () => {

    await waitFor(async () => {
        expect(document.getElementsByClassName('ant-comment').length).toBe(4);
        const expandAction = screen.getByText(/View more replies/i);
        fireEvent.click(expandAction);

        await waitFor(() => {
            expect(screen.getByText(/Inner comment/i)).toBeInTheDocument()

            // should contain 5 elements (4 user comments + 1 comment editor)
            expect(document.getElementsByClassName('ant-comment').length).toBe(5);
        });
    });
});

test('test deleting a comment', async () => {

    await waitFor(async () => {
        expect(document.getElementsByClassName('ant-comment').length).toBe(4);
        const deleteAction = screen.getAllByText(/Delete/i)[0];
        fireEvent.click(deleteAction);
        fireEvent.click(screen.getByText(/OK/i));

        await waitFor(() => {
            expect(screen.getByText(/This message was deleted by the original author or a moderator/i)).toBeInTheDocument();
            expect(document.getElementsByClassName('ant-comment').length).toBe(4);
        });
    })
});

test('test making a new top level comment', async () => {

    await waitFor(async () => {
        expect(document.getElementsByClassName('ant-comment').length).toBe(4);

        const editor = screen.getByPlaceholderText(/Add a comment/i);

        fireEvent.change(editor, { target: { value: 'New comment' } });

        fireEvent.click(screen.getByText(/Add Comment/i));

        await waitFor(() => expect(document.getElementsByClassName('ant-comment').length).toBe(5));
    }, { timeout: 60000 })
});