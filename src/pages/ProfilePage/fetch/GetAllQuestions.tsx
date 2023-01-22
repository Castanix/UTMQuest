import { useEffect, useState } from "react";
import { QuestionFrontEndType } from "../../../../backend/types/Questions";
import { TimelineType } from "../ProfilePage";

const GetAllQuestions = (userId: string, setTimeline: Function) => {

    const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
    const [errorQuestions, setErrorQuestions] = useState('');

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URI}/question/allUserPostedQuestions/${userId}`)
            .then((res: Response) => {
                if (!res.ok) throw Error(res.statusText);
                return res.json();
            }).then((result) => {
                const timelineArr: TimelineType[] = [];

                result.forEach((question: QuestionFrontEndType) => {
                    const { courseId, _id: qnsId, qnsLink, qnsName, date } = question;

                    timelineArr.push({
                        courseId,
                        qnsId,
                        qnsLink,
                        qnsName,
                        date
                    });
                });

                timelineArr.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

                setTimeline(timelineArr);
                setLoadingQuestions(false);
            }).catch((err) => {
                setErrorQuestions(err.message);
                setLoadingQuestions(false);
            });

    }, [setTimeline, userId]);

    return {
        loadingQuestions,
        errorQuestions,
    };
};

export default GetAllQuestions;