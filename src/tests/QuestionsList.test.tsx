import React from 'react';
import TopicsType from '../../backend/types/Topics';
import { fireEvent, render, screen } from '@testing-library/react';
import QuestionsList from '../pages/QuestionsPage/QuestionsList';
import { qnsTypeEnum, QuestionsType } from '../../backend/types/Questions';
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
        numQuestions: 0,
        course: 'test'
    },
    {
        _id: '12345',
        topicName: 'Arrays',
        numQuestions: 1,
        course: 'test'
    }
]

const questions: QuestionsType[] = [
    {
        _id: 'abcd',
        link: 'abcd',
        topicId: '12345',
        topicName: 'Strings',
        courseId: 'test',
        qnsName: 'Hello World Strings',
        qnsType: qnsTypeEnum.mc,
        desc: 'description',
        xplan: 'none',
        choices: [],
        ans: '',
        authId: 'Bob',
        authName: 'Bob Bob',
        date: 'Mon Oct 24 2022',
        numDiscussions: 1,
        anon: false,
        latest: true,
    },
    {
        _id: 'abcde',
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
        date: 'Mon Oct 24 2022',
        numDiscussions: 0,
        anon: false,
        latest: true
    },
]

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<QuestionsList questions={questions} topics={topics} />, { wrapper: BrowserRouter })
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
    expect(searchBar.value).toBe('arrays');

    // list now contains only one row
    expect(document.getElementsByTagName('ul')[0].children.length).toBe(1)
})