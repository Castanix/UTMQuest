import React from 'react';
import CoursesType from '../../backend/types/Courses';
import { fireEvent, getByPlaceholderText, prettyDOM, render, screen, waitFor } from '@testing-library/react';
import CourseBoardTable from '../components/CourseBoard/CourseBoardTable';
import { BrowserRouter } from 'react-router-dom';
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
    rest.put(`${process.env.REACT_APP_API_URI}/course/addCourse`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({})
        )
    }),
)


const courses: CoursesType[] = [
    {
        _id: "1234",
        courseId: "CSC108",
        courseName: "Introduction to Computer Science",
        numTopics: 0,
        added: true
    },
    {
        _id: "12345",
        courseId: "CSC373",
        courseName: "VERY PAINFUL COURSE",
        numTopics: 2,
        added: true
    },
    {
        _id: "abc",
        courseId: "ABC101",
        courseName: "ABC",
        numTopics: 0,
        added: false
    }
]

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<CourseBoardTable dataSource={courses} />, { wrapper: BrowserRouter })
    document = container;
})

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());


test('test table content', () => {
    const firstCourse = screen.getByText(/Introduction to Computer Science/i);
    const secondCourse = screen.getByText(/VERY PAINFUL COURSE/i);

    expect(firstCourse).toBeInTheDocument();
    expect(secondCourse).toBeInTheDocument();
});

test('test searching for course', () => {
    const searchBar: HTMLInputElement = screen.getByPlaceholderText(/Search Course/i);

    // table contains two rows
    expect(document.getElementsByTagName('tbody')[0].children.length).toBe(2);

    fireEvent.change(searchBar, { target: { value: '108' } });
    expect(searchBar.value).toBe('108');

    // table now contains only one row
    expect(document.getElementsByTagName('tbody')[0].children.length).toBe(1);
})

test('test adding a course', async () => {

    // open the modal and open dropdown
    fireEvent.click(screen.getByText(/Add a Course/i));

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    // select course
    fireEvent.click(screen.getByText('ABC101: ABC'));
    fireEvent.click(screen.getByText(/OK/i))

    await waitFor(() => expect(document.getElementsByTagName('tbody')[0].children.length).toBe(3));
})