import React from 'react';
import CoursesType from '../../backend/types/Courses';
import { fireEvent, getByPlaceholderText, prettyDOM, render, screen, waitFor } from '@testing-library/react';
import CourseBoardTable from '../components/CourseBoard/CourseBoardTable';
import { BrowserRouter } from 'react-router-dom';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import CourseBoard from '../components/CourseBoard/CourseBoard';
import { TIMEOUT } from 'dns';
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
    rest.get(`${process.env.REACT_APP_API_URI}/course/getAllCourses`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(courses)
        )
    }),
    rest.put(`${process.env.REACT_APP_API_URI}/course/addCourse`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({})
        )
    }),
);


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
];

let document: HTMLElement;


describe('CourseBoard', () => {
    beforeEach(() => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <CourseBoard />
                </QueryClientProvider>, 
            { wrapper: BrowserRouter }
        );
        document = container;
    })
    
    beforeAll(() => {
        server.listen();
    })
    
    afterEach(() => server.resetHandlers());
    
    afterAll(() => server.close());

    test('test adding a course', async () => {

        await waitFor(() => {
            expect(screen.getByText(/Add a Course/i)).toBeInTheDocument();

            // open the modal and open dropdown
            fireEvent.click(screen.getByText(/Add a Course/i));
        
            const combobox = screen.getAllByRole('combobox')[1];
            fireEvent.mouseDown(combobox);
        
            // select course
            fireEvent.click(screen.getByText('ABC101: ABC'));
            fireEvent.click(screen.getByText(/OK/i));
    
        
            waitFor(() => expect(document.getElementsByTagName('tbody')[0].children.length).toBe(3));
        }, { timeout: 60000 });
    })
})


// describe('CourseBoardTable', () => {
//     beforeEach(() => {
//         const { container } = render(<CourseBoardTable dataSource={courses} />, { wrapper: BrowserRouter })
//         document = container;
//     })
    
//     beforeAll(() => {
//         server.listen();
//     })
    
//     afterEach(() => server.resetHandlers());
    
//     afterAll(() => server.close());
    
    
//     test('test adding a course', async () => {
    
//         // open the modal and open dropdown
//         fireEvent.click(screen.getByText(/Add a Course/i));
    
//         const combobox = screen.getAllByRole('combobox')[1];
//         fireEvent.mouseDown(combobox);
    
//         // select course
//         fireEvent.click(screen.getByText('ABC101: ABC'));
//         fireEvent.click(screen.getByText(/OK/i));
    
//         await waitFor(() => 
//             expect(document.getElementsByTagName('tbody')[0].children.length).toBe(3)
//         );
//     })
// })
