import { useEffect, useState } from "react";
import { QuestionsType } from "../../../../backend/types/Questions";

// const mockedTopics = ["Strings", "Arrays", "Topic 3", "Topic 4"];

const GetQuestions = (courseCode: string, getApproved: boolean) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [questions, setQuestions] = useState<QuestionsType[]>([]);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_API_URI}/question/${courseCode}/${getApproved ? 'approved' : 'pending'}`
        )
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            })
            .then((result) => {
                setQuestions(result);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });

        // MOCK DATA
        // const data: MockType[] = Array.from({ length: 23 }).map((_, i) => ({
        //     href: 'https://ant.design',
        //     title: `Question title ${i}`,
        //     author: "Bob",
        //     date: new Date().toDateString(),
        //     avatar: 'https://joeschmoe.io/api/v1/random',
        //     topic: mockedTopics[Math.floor(Math.random() * mockedTopics.length)]
        //     // content:
        //     //     'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
        // }));

        // setQuestions(data);
        // setError('');
    }, [courseCode, getApproved]);

    return {
        loading,
        questions,
        error,
    };
};

export default GetQuestions;