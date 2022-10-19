import React from 'react';
import CoursesType from '../../backend/types/Courses';
import { fireEvent, render, screen } from '@testing-library/react';
import CourseBoardTable from '../pages/CourseBoard/CourseBoardTable';
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

const courses: CoursesType[] = [
    {
        _id: "1234",
        courseId: "CSC108",
        courseName: "Introduction to Computer Science",
        numTopics: 0
    },
    {
        _id: "12345",
        courseId: "CSC373",
        courseName: "VERY PAINFUL COURSE",
        numTopics: 2
    }
]

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<CourseBoardTable dataSource={courses} />, {wrapper: BrowserRouter})
    document = container;

});

test('test table content', () => {
    const firstCourse = screen.getByText(/Introduction to Computer Science/i);
    const secondCourse = screen.getByText(/VERY PAINFUL COURSE/i);

    expect(firstCourse).toBeInTheDocument();
    expect(secondCourse).toBeInTheDocument();
});

test('test searching for course', () => {
    const searchBar: HTMLInputElement = screen.getByPlaceholderText(/Search Course/i);

    // table contains two rows
    expect(document.getElementsByTagName('tbody')[0].children.length).toBe(2)

    fireEvent.change(searchBar, { target: { value: '108' } });
    expect(searchBar.value).toBe('108');

    // table now contains only one row
    expect(document.getElementsByTagName('tbody')[0].children.length).toBe(1)
})