import React from 'react';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import AddMultipleChoice, { AddOptionType } from '../components/MultipleChoice/AddMultipleChoice/AddMultipleChoice';

Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
})

const option1: AddOptionType = {
    value: "",
    isCorrect: false
};

const option2: AddOptionType = {
    value: "",
    isCorrect: false
};

let document: HTMLElement;



beforeEach(() => {
    const Wrapper = () => {
        const [options, setOptions] = React.useState<AddOptionType[]>([option1, option2])
        return <AddMultipleChoice options={options} setOptions={setOptions} />
    }
    const { container } = render(<Wrapper />);
    document = container;
    expect(document.getElementsByClassName('ant-checkbox-input').length).toBe(2);
    expect(screen.getByText(/Remove option/i).closest('button')).toBeDisabled();
});

test('test adding 5 options', () => {
    fireEvent.click(screen.getByText(/Add option/i));
    fireEvent.click(screen.getByText(/Add option/i));
    fireEvent.click(screen.getByText(/Add option/i));
    expect(document.getElementsByClassName('ant-checkbox-input').length).toBe(5);

    expect(screen.getByText(/Add option/i).closest('button')).toBeDisabled();
    expect(screen.getByText(/Remove option/i).closest('button')).toBeEnabled();

})