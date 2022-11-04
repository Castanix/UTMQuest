import { useEffect, useState } from "react";
import { QuestionsType } from "../../../../backend/types/Questions";
import { TimelineType } from "../ProfilePage";

const GetAllQuestions = (utorid: string, setTimeline: Function) => {

    const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
    const [errorQuestions, setErrorQuestions] = useState('');

    useEffect(() => {
            fetch(`${process.env.REACT_APP_API_URI}/question/allPostedQuestions/${utorid}`)
                .then((res: Response) => {
                    if (!res.ok) throw Error(res.statusText);
                    return res.json();
                }).then((result) => {
                    console.log("1");
                    const timelineArr: TimelineType[] = [];
                    
                    result.forEach((question: QuestionsType) => {
                        timelineArr.push({
                            courseId: question.courseId,
                            questionId: question._id,
                            questionName: question.qnsName,
                            date: question.date
                        });
                    });

                    timelineArr.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

                    setTimeline(timelineArr);
                    setLoadingQuestions(false);
                }).catch((err) => {
                    setErrorQuestions(err.message);
                    setLoadingQuestions(false);
                });

    }, [utorid, setTimeline]);

    return {
        loadingQuestions,
        errorQuestions,
    };
};

export default GetAllQuestions;