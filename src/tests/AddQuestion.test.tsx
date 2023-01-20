import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import TopicsType from '../../backend/types/Topics';
import AQStepOne from '../pages/AddQuestionPage/AQStepOne';
import AQStepTwo from '../pages/AddQuestionPage/AQStepTwo';
import { ThemeContext } from '../components/Topbar/Topbar';
import { QuestionsType } from '../../backend/types/Questions';
import qnsTypeEnum from '../pages/AddQuestionPage/types/QnsTypeEnum';
import AddQuestionPage from '../pages/AddQuestionPage/AddQuestionPage';
import { setupServer } from 'msw/lib/node';
import { rest } from 'msw';

Object.defineProperty(window, 'matchMedia', {
    value: () => {
        return {
            matches: false,
            addListener: () => { },
            removeListener: () => { }
        };
    }
});


const req: TopicsType = {
    _id: "abcd1234",
    topicName: "ABCD",
    courseId: "ABC123",
    numQns: 0
}

const question: QuestionsType = {
    _id: 'abcd',
    qnsLink: 'abcd',
    topicId: '12345',
    topicName: 'ABCD',
    courseId: 'ABC123',
    qnsName: 'Hello World Strings',
    qnsType: qnsTypeEnum.mc,
    description: 'description',
    explanation: 'none',
    choices: [],
    answers: '',
    utorId: 'Bob',
    utorName: 'Bob Bob',
    date: 'Mon Oct 24 2022',
    numDiscussions: 1,
    anon: false,
    latest: true,
    rating: {},
    likes: 0,
    dislikes: 0,
    views: 1,
    viewers: {}
}


const customRender = (
    <MemoryRouter
        initialEntries={["/courses/ABC123/addQuestion"]}
    >
        <Routes>
            <Route path="/courses/:courseId/addQuestion" element={<AddQuestionPage edit={false} />} />
        </Routes>
    </MemoryRouter>
);

const customRenderEdit = (
    <MemoryRouter
        initialEntries={[{ pathname: "/courses/ABC123/editQuestion", state: { question } }]}
    >
        <Routes>
            <Route path="/courses/:courseId/editQuestion" element={<AddQuestionPage edit={true} />} />
        </Routes>
    </MemoryRouter>
)



// mock server calls
const server = setupServer(
    rest.get(`${process.env.REACT_APP_API_URI}/topic/getTopics/:courseId`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([{
                _id: "abcd1234",
                topicName: "ABCD",
                courseId: "ABC123",
                numQns: 0
            }])
        )
    }),

    rest.get(`${process.env.REACT_APP_API_URI}/question/similar/abcd1234/:originalQnsId/:term`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({})
        )
    }),

    rest.put(`${process.env.REACT_APP_API_URI}/badge/unlockTier`, (req, res, ctx) => {
        return res(
            ctx.status(201),
            ctx.json({
                qnsLink: "abcde",
                qnsStatus: 1,
                consecutivePosting: 1,
                unlockedBadges: {
                    addQns: null,
                    consecutivePosting: null,
                    dailyLogin: "dailybadge",
                    editQns: null,
                    threadReplies: null
                },
                edit: false
            })
        )
    })
);

beforeAll(() => {
    server.listen();
})

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('AddQuestionPage -> Header', () => {
    let document: HTMLElement;

    beforeEach(() => {
        // const { container } = render(<Route path="/courses/:id/addQuestion" element={<AddQuestionPage edit={false} />} />, { wrapper: wrapperProviders });
        const { container } = render(customRender);
        document = container;
    });

    test('header', async () => {
        await waitFor(() => {
            expect(screen.getAllByText(/Add a Question/i).length).toBe(2);
            expect(screen.getAllByText(/ABC123/i).length).toBe(2);
        })
    })
})

describe('AQStepOne', () => {
    let document: HTMLElement;

    beforeEach(() => {
        const Wrapper = () => {
            const [currStep, setCurrStep] = React.useState<number>(0);
            const [topicSelected, setTopicSelect] = React.useState<[string, string]>(["", ""]);
            return <AQStepOne courseId={"ABC123"} topics={[req]} setCurrStep={setCurrStep} setTopicSelected={setTopicSelect} />
        }

        const { container } = render(<Wrapper />, { wrapper: BrowserRouter });
        document = container;
    });


    test('check if part one of add question loads', () => {
        const info = screen.getByText(/If the topic you are trying to select does not exist, please add it here:/i);
        const label = screen.getByLabelText(/Select the topic this question is for/i);

        expect(info).toBeInTheDocument();
        expect(label).toBeInTheDocument();
    })

    test('check if part one of button enables', () => {
        expect(screen.getByText(/Next/i).parentElement).toBeDisabled();

        const combobox = screen.getByRole('combobox');
        fireEvent.mouseDown(combobox);
        // expect(screen.getByText(/ABCD/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText('ABCD'));

        expect(screen.getByText(/Next/i).parentElement).toBeEnabled();
    })
})

describe('AQStepTwo', () => {
    let document: HTMLElement;

    beforeEach(() => {
        const Wrapper = () => {
            const [currStep, setCurrStep] = React.useState<number>(1)
            const [topicSelected, setTopicSelect] = React.useState<[string, string]>(["abcd1234", "ABCD"])
            return (
                <ThemeContext.Provider value={true}>
                    <AQStepTwo courseId={"ABC123"} topicSelected={topicSelected} setCurrStep={setCurrStep} edit={false} />
                </ThemeContext.Provider>
            )
        }

        const { container } = render(<Wrapper />, { wrapper: BrowserRouter });
        document = container;
    });

    test('check if part two of add question loads', () => {
        const topic = screen.getByText(/Topic: ABCD/i);
        const type = screen.getByTitle(/Answer Type/i);

        expect(topic).toBeInTheDocument();
        expect(type).toBeInTheDocument();
    })

    test('check if part two of solution appears', () => {
        expect(screen.getByTitle(/Solution/i)).not.toBeVisible();

        const combobox = screen.getByRole('combobox');
        fireEvent.mouseDown(combobox);
        fireEvent.click(screen.getByText(/Short Answer/i));

        expect(screen.getByTitle(/Solution/i)).toBeVisible();
        expect(screen.getByPlaceholderText(/Add Solution/i)).toBeInTheDocument();
    })

    test('check if part two of button enables', () => {
        expect(screen.getByText(/Submit/i).parentElement).toBeDisabled();

        const titleInput = screen.getByPlaceholderText(/Add Question Title/i);
        fireEvent.change(titleInput, { target: { value: "There is title" } });
        expect(screen.getByText(/Submit/i).parentElement).toBeDisabled();

        const combobox = screen.getByRole('combobox');
        fireEvent.mouseDown(combobox);
        fireEvent.click(screen.getByText(/Short Answer/i));
        const solInput = screen.getByPlaceholderText(/Add Solution/i);
        fireEvent.change(solInput, { target: { value: "There is solution" } });
        expect(screen.getByText(/Submit/i).parentElement).toBeDisabled();

        const problemInput = screen.getByPlaceholderText(/Add Problem/i);
        fireEvent.change(problemInput, { target: { value: "There is problem" } });

        expect(screen.getByText(/Submit/i).parentElement).toBeEnabled();
    })

    test('check if MDEditor preview works', () => {
        const problemInput = screen.getByPlaceholderText(/Add Problem/i);
        fireEvent.change(problemInput, { target: { value: "There is problem" } });

        const previewButton = screen.getByTitle("Preview code (ctrl + 9)");
        fireEvent.click(previewButton);

        expect(screen.getByText(/There is problem/i)).toBeInTheDocument();
    })
})


describe('Load editable question from useLocation', () => {
    let document: HTMLElement;

    beforeEach(() => {

        const { container } = render(customRenderEdit);
        document = container;
    });

    test('check if AQStepOne is loaded with state', async () => {
        await waitFor(() => {
            // Select value goes by title
            expect(screen.getByTitle(/ABCD/i)).toBeInTheDocument();
            expect(screen.getByText(/Next/i).parentElement).toBeEnabled();
        });
    });

    test('check if AQStepTwo is loaded with state', async () => {
        await waitFor(() => {
            // Select value goes by title
            const next = screen.getByText(/Next/i).parentElement;

            if (next) {
                fireEvent.click(next);
            }

            expect(screen.getByPlaceholderText(/Add Question Title/i)).toHaveValue("Hello World Strings");

        }, { timeout: 60000 });
    });

})


