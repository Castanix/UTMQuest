import { useQuery } from "react-query";
import { DiscussionFrontEndType } from "../../../../backend/types/Discussion";

const fetchData = async (qnsLink: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URI}/discussion/thread/${qnsLink}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

const GetOPComments = (qnsLink: string) => {

    const comments: DiscussionFrontEndType[] = [];

    const result = useQuery(["opDiscussion", qnsLink], () => fetchData(qnsLink), {
        onSuccess: (data) => comments.push(...data.discussion)
    });

    return {
        loading: result.isLoading,
        comments,
        error: result.error,
    };
};

export default GetOPComments;