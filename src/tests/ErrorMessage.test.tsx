import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
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

test('test refresh error component', () => {

    render(<ErrorMessage title="Not Found" link="." message="Refresh" />);

    expect(screen.getByText("Refresh")).toBeInTheDocument();

    expect(document.querySelectorAll('a').length).toBe(0);

});

test('test link error component', () => {

    render(<ErrorMessage title="Not Found" link="/courses" message="Go back to courses" />, { wrapper: BrowserRouter });

    expect(screen.getByText("Go back to courses")).toBeInTheDocument();

    expect(document.querySelectorAll('a').length).toBe(1);

});