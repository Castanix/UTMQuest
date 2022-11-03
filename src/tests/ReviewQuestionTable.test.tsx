import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReviewQuestionsTable from '../pages/DashboardPage/ReviewQuestionTable';
import WidgetType from '../pages/DashboardPage/types/Widget';

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

const reviewQnsData: WidgetType[] = [
    {
        courseCode: 'CSC108',
        topic: 'Strings',
        qnsName: 'Test',
        reviewStatus: 'pending'
    },
    {
        courseCode: 'ANT101',
        topic: 'ANT Topic',
        qnsName: 'ANT Question',
        reviewStatus: 'pending'
    }
]

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<ReviewQuestionsTable reviewQnsData={reviewQnsData} paginationConfig={paginationConfig} />, { wrapper: BrowserRouter });
    document = container;
});

test('test table renders correctly', () => {

    expect(screen.getByText(/CSC108/i)).toBeInTheDocument();
    expect(screen.getByText(/ANT101/i)).toBeInTheDocument();
})
