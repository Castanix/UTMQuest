import React from 'react';
import TopicsType from '../../backend/types/Topics';
import { fireEvent, render, screen } from '@testing-library/react';
import TopicsTable from '../pages/ManageTopics/TopicsTable';

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

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<TopicsTable courseId='test' topics={topics} />)
    document = container;

});

test('test table content', () => {
    const firstTopic = screen.getByText(/Strings/i);
    const secondTopic = screen.getByText(/Arrays/i);

    expect(firstTopic).toBeInTheDocument();
    expect(secondTopic).toBeInTheDocument();
});

test('test that one delete action is disabled and one is enabled', () => {
    expect(document.getElementsByClassName('deleteDisabled').length).toBe(1);
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