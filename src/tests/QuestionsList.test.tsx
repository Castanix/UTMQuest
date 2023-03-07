import React from 'react';
import { TopicsFrontEndType } from '../../backend/types/Topics';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuestionsList } from '../pages/QuestionsPage/QuestionsList';
import { qnsTypeEnum, QuestionFrontEndType } from '../../backend/types/Questions';
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

const topics: TopicsFrontEndType[] = [
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

const questions: QuestionFrontEndType[] = [
    {
        _id: 'abcd',
        qnsLink: 'abcd',
        topicId: '12345',
        topicName: 'Strings',
        courseId: 'test',
        qnsName: 'Hello World Strings',
        qnsType: qnsTypeEnum.mc,
        description: 'description',
        explanation: 'none',
        choices: [],
        answers: '',
        utorName: 'Bob Bob',
        userId: "123",
        anonId: "1",
        date: 'Mon Oct 24 2022',
        numDiscussions: 1,
        anon: false,
        latest: true,
        rating: {},
        likes: 0,
        dislikes: 0,
        views: 1,
        viewers: {},
        score: 0,
    },
    {
        _id: 'abcde',
        qnsLink: 'abcde',
        topicId: '123456',
        topicName: 'Arrays',
        courseId: 'test',
        qnsName: 'Arrays question',
        qnsType: qnsTypeEnum.mc,
        description: 'description',
        explanation: 'none',
        choices: [],
        answers: '',
        utorName: 'Bob Bob',
        userId: "123",
        anonId: "1",
        date: 'Mon Oct 24 2022',
        numDiscussions: 0,
        anon: false,
        latest: true,
        rating: {},
        likes: 0,
        dislikes: 0,
        views: 1,
        viewers: {},
        score: 0,
    },
]

let document: HTMLElement;

// queryStatus={{ fetchData: { questions, totalNumQns: 2 }, loading: false, error: false }} topics={topics} 

beforeEach(() => {
    const { container } = render(
        <QueryClientProvider client={queryClient}>
            <QuestionsList courseId="test" />
        </QueryClientProvider>,
        { wrapper: BrowserRouter }
    );
    document = container;
});

test('test list content', () => {
    const firstTopic = screen.getByText(/Hello World Strings/i);
    const secondTopic = screen.getByText(/Arrays question/i);

    expect(firstTopic).toBeInTheDocument();
    expect(secondTopic).toBeInTheDocument();
});

test('test searching for question', () => {
    const searchBar: HTMLInputElement = screen.getByPlaceholderText(/Search question/i);

    // list contains two rows
    expect(document.getElementsByTagName('ul')[0].children.length).toBe(2)

    fireEvent.change(searchBar, { target: { value: 'arrays' } });
    expect(searchBar.value).toBe('arrays');

    // list now contains only one row
    expect(document.getElementsByTagName('ul')[0].children.length).toBe(1)
})