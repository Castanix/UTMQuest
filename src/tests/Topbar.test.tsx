import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Topbar from '../components/Topbar/Topbar';

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

const server = setupServer(
    rest.put(`${process.env.REACT_APP_API_URI}/account/setup`, (req, res, ctx) => {
        return res(
            ctx.status(201),
            ctx.json({
                username: "Dummy Test",
                utorid: "dummy22"
            })
        )
    }),
)

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

beforeEach(() => {
    const { container } = render(<Topbar children={undefined} />, { wrapper: BrowserRouter });
    document = container;
});

test("logo", async () => {
    await waitFor(() => {
        expect(screen.getByText(/utmQuest/i)).toBeInTheDocument();
    }, { timeout: 60000 });
})

test("dropdown", async () => {
    await waitFor(() => {
        expect(screen.getByText(/Dummy/i)).toBeInTheDocument();
        const menu = screen.getByRole("menuitem");

        fireEvent.mouseOver(menu);

        waitFor(() => {
            expect(screen.getByText(/Profile/i)).toBeInTheDocument();
            expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument();
            expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
        })
    }, { timeout: 60000 });
})