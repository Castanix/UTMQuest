import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MultipleChoice from '../components/MultipleChoice/MultipleChoice';

Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
})

let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<MultipleChoice options={["Option A", "Option B", "Option C", "Option D"]} answers={["Option A", "Option C"]} explanation="" />);
    document = container;
});

test('test that all four options load', () => {
    const firstOption = screen.getByText(/Option A/i);
    const secondOption = screen.getByText(/Option B/i);
    const thirdOption = screen.getByText(/Option C/i);
    const fourthOption = screen.getByText(/Option D/i);

    expect(firstOption).toBeInTheDocument();
    expect(secondOption).toBeInTheDocument();
    expect(thirdOption).toBeInTheDocument();
    expect(fourthOption).toBeInTheDocument();
});

test('test selecting 3 options', () => {

    // ensure no feedback is given
    expect(document.getElementsByClassName('green').length).toBe(0);
    expect(document.getElementsByClassName('red').length).toBe(0);

    // select 3 options
    fireEvent.click(screen.getByText(/Option A/i));
    fireEvent.click(screen.getByText(/Option B/i));
    fireEvent.click(screen.getByText(/Option C/i));

    fireEvent.click(screen.getByText(/Check Answers/i))

    // ensure correct feedback is given
    expect(document.getElementsByClassName('green').length).toBe(2);
    expect(document.getElementsByClassName('red').length).toBe(1);
})

test('test resetting all options', () => {

    // select an option
    fireEvent.click(screen.getByText(/Option B/i));
    fireEvent.click(screen.getByText(/Check Answers/i))
    expect(document.getElementsByClassName('green').length).toBe(2);
    expect(document.getElementsByClassName('red').length).toBe(1);

    // reset all options
    fireEvent.click(screen.getByText(/Reset/i))
    expect(document.getElementsByClassName('green').length).toBe(0);
    expect(document.getElementsByClassName('red').length).toBe(0);
})
