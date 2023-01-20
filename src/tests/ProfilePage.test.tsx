import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import { setupServer } from 'msw/lib/node';
import { rest } from 'msw';
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

// mock add topic fetch call
const server = setupServer(
    rest.get(`${process.env.REACT_APP_API_URI}/account/getAccount`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                _id: new Object("636544b3de321c160f0b155a"),
                utorid: 'dummy22',
                utorName: 'Dummy Test',
                savedCourses: ['CSC108'],
                colour: 'red',
                badges: []
            })
        )
    }),

    rest.get(`${process.env.REACT_APP_API_URI}/badge/userBadges`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                displayBadges: ["addbadge1"],
                unlockedBadges: ["addbadge1", "editbadge1"]
            })
        );
    }),

    rest.get(`${process.env.REACT_APP_API_URI}/question/allUserPostedQuestions`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([{
                _id: new Object("6364845d0c0097f9fb228e53"),
                topicId: new Object("63647f9cedab8ca082c2c71e"),
                topicName: 'Strings',
                courseId: 'CSC108',
                qnsName: 'String Title Test',
                qnsStatus: 'approved',
                reviewStatus: 0,
                qnsType: 'mc',
                desc: 'Answer is 3',
                xplan: 'Sike',
                choices: ['1', '2', '3'],
                ans: ['2'],
                utorId: 'dummy22',
                utorName: 'Dummy Test',
                date: '2022-11-04T03:17:49.838Z',
                numDiscussions: 0,
                anon: false,
                snapshot: null
            }])
        )
    }),
)


let document: HTMLElement;

beforeEach(() => {
    const { container } = render(<ProfilePage />, { wrapper: BrowserRouter });
    document = container;
});

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

test('profile page renders correctly', async () => {
    await waitFor(() => {
        expect(screen.getByText(/Dummy Test/i)).toBeInTheDocument();
        expect(screen.getAllByText(/badges/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/Activity Timeline/i)).toBeInTheDocument();
        expect(screen.getByText(/String Title Test/i)).toBeInTheDocument();
    });
});

test('badge picker modal opens and functionality', async () => {
    await waitFor(() => {
        const btn = screen.getByText(/Customize Badges/i);
        fireEvent.click(btn);
        expect(screen.getByText(/Select up to 3 Badges to be Displayed/i)).toBeInTheDocument();

        expect(screen.getByText(/Selected 1\/3/i)).toBeInTheDocument();
        const secondBadge = screen.getAllByAltText(/badge display icon/i)[1];
        fireEvent.click(secondBadge)
        expect(screen.getByText(/Selected 2\/3/i)).toBeInTheDocument();

    }, { timeout: 60000 });
});
