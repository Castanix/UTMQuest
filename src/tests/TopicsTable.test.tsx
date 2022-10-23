import React from 'react';
import TopicsType from '../../backend/types/Topics';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TopicsTable from '../pages/ManageTopics/TopicsTable';
import { rest } from 'msw'
import { setupServer } from 'msw/node'

Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
})

// mock add topic fetch call
const server = setupServer(
    rest.post(`${process.env.REACT_APP_API_URI}/topic/addTopic`, (req, res, ctx) => {
        return res(
            ctx.status(201),
            ctx.json({ authorized: true, insertedId: 'abcd' })
        )
    }),
)

const topics: TopicsType[] = [
    {
        _id: '1234',
        topicName: 'Strings',
        numApproved: 0,
        numPending: 0,
        course: 'test'
    },
    {
        _id: '12345',
        topicName: 'Arrays',
        numApproved: 1,
        numPending: 0,
        course: 'test'
    }
]

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<TopicsTable courseId='test' topics={topics} />)
    document = container;
});

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());


test('test table content', () => {
    const firstTopic = screen.getByText(/Strings/i);
    const secondTopic = screen.getByText(/Arrays/i);

    expect(firstTopic).toBeInTheDocument();
    expect(secondTopic).toBeInTheDocument();
});

test('test that one delete action is disabled and one is enabled', () => {
    expect(document.getElementsByClassName('delete-disabled').length).toBe(1);
    expect(document.getElementsByClassName('delete').length).toBe(1);
})

test('test searching for topic', () => {
    const searchBar: HTMLInputElement = screen.getByPlaceholderText(/Search topic/i);

    // table contains two rows
    expect(document.getElementsByTagName('tbody')[0].children.length).toBe(2)

    fireEvent.change(searchBar, { target: { value: 'Arrays' } });
    expect(searchBar.value).toBe('Arrays');

    // table now contains only one row
    expect(document.getElementsByTagName('tbody')[0].children.length).toBe(1)
})

test('test adding a course', async () => {

    // table contains two rows
    expect(document.getElementsByTagName('tbody')[0].children.length).toBe(2)

    fireEvent.click(screen.getByText('Add a new topic'));
    screen.getByText(/Add a topic for test/i)

    const inputNode = screen.getByLabelText(/Topic Name/i)

    // add a new topic
    fireEvent.change(inputNode, { target: { value: 'New Topic' } });
    fireEvent.click(screen.getByText(/Save/i))

    // table should now have 3 rows
    await waitFor(() => expect(document.getElementsByTagName('tbody')[0].children.length).toBe(3));
})