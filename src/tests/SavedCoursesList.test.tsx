import React from 'react';
import { render, screen } from '@testing-library/react';
import SavedCoursesList from '../pages/DashboardPage/SavedCoursesList';
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

const paginationConfig = (total: number, size: number) => ({
    defaultCurrent: 1,
    total,
    pageSize: size,
});

const courseData: [string, string][] = [
    ['/courses/CSC108', 'CSC108'],
    ['/courses/ANT101', 'ANT101']
]

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<SavedCoursesList courseData={courseData} paginationConfig={paginationConfig} />, { wrapper: BrowserRouter });
    document = container;
});

test('test list renders correctly', () => {

    expect(screen.getByText(/CSC108/i)).toBeInTheDocument();
    expect(screen.getByText(/ANT101/i)).toBeInTheDocument();
})
