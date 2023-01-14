import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ShortAnswer from '../components/ShortAnswer/ShortAnswer';

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
    const { container } = render(<ShortAnswer answer="Test answer" setHasAnswered={()=>{}} />);
    document = container;
});

test('test short answer component', () => {

    expect(screen.queryByText("Solution")).not.toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Type your answer here");

    fireEvent.change(textarea, { target: { value: 'abc 123' } });

    fireEvent.click(screen.getByText("Submit"));

    expect(screen.getByText("Solution")).toBeInTheDocument();

});