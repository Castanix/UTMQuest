import React from 'react';
import TopicsType from '../../backend/types/Topics';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TopicsTable from '../pages/ManageTopics/TopicsTable';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

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

    rest.put(`${process.env.REACT_APP_API_URI}/topic/putTopic`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({})
        )
    }),
    rest.delete(`${process.env.REACT_APP_API_URI}/topic/deleteTopic`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({})
        )
    }),
)

const topics: TopicsType[] = [
    {
        _id: '1234',
        topicName: 'Strings',
        numQns: 0,
        courseId: 'test',
        deleted: false,
    },
    {
        _id: '12345',
        topicName: 'Arrays',
        numQns: 1,
        courseId: 'test',
        deleted: false,
    }
]

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(
            <QueryClientProvider client={queryClient}>
                <TopicsTable courseId='test' topics={topics} />
            </QueryClientProvider>,
        { wrapper: BrowserRouter })
            
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

test('test adding a topic', async () => {

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

test('test editing an existing topic name', async () => {

    // original topic name
    expect(screen.getByText(/Strings/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByText(/Rename/i)[0]);

    const inputNode = screen.getByDisplayValue(/Strings/i);

    fireEvent.change(inputNode, { target: { value: 'Edited topic' } });

    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => expect(screen.getByText(/Edited topic/i)).toBeInTheDocument());
})

test('test deleting an existing topic', async () => {

    // table contains two rows
    expect(document.getElementsByTagName('tbody')[0].children.length).toBe(2);

    // confirm delete popup
    fireEvent.click(screen.getAllByText(/Delete/i)[0]);
    fireEvent.click(screen.getByText(/OK/i));

    // table contains one row
    await waitFor(() => expect(document.getElementsByTagName('tbody')[0].children.length).toBe(1));
})