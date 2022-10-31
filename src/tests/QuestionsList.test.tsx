import React from 'react';
import TopicsType from '../../backend/types/Topics';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import QuestionsList from '../pages/QuestionsPage/QuestionsList';
import { qnsStatusType, qnsTypeEnum, QuestionsType } from '../../backend/types/Questions';
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

const questions: QuestionsType[] = [
    {
        _id: 'abcd',
        topicId: '12345',
        topicName: 'Strings',
        courseId: 'test',
        qnsName: 'Hello World Strings',
        qnsStatus: qnsStatusType.approved,
        reviewStatus: 0,
        qnsType: qnsTypeEnum.mc,
        desc: 'description',
        xplan: 'none',
        choices: [],
        ans: '',
        authId: 'Bob',
        authName: 'Bob Bob',
        date: 'Mon Oct 24 2022',
        numDiscussions: 1,
        snapshot: null,
    },
    {
        _id: 'abcde',
        topicId: '123456',
        topicName: 'Arrays',
        courseId: 'test',
        qnsName: 'Arrays question',
        qnsStatus: qnsStatusType.approved,
        reviewStatus: 0,
        qnsType: qnsTypeEnum.mc,
        desc: 'description',
        xplan: 'none',
        choices: [],
        ans: '',
        authId: 'Bob',
        authName: 'Bob Bob',
        date: 'Mon Oct 24 2022',
        numDiscussions: 0,
        snapshot: null,
    },
]

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<QuestionsList questions={questions} topics={topics} approved />, { wrapper: BrowserRouter })
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

    fireEvent.change(searchBar, { target: { value: 'Arrays' } });
    expect(searchBar.value).toBe('Arrays');

    // list now contains only one row
    expect(document.getElementsByTagName('ul')[0].children.length).toBe(1)
})