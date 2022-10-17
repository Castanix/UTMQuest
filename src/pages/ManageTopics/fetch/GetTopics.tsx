import { useEffect, useState } from "react";
import Topics from "../../../../backend/types/Topics";

const GetAllTopics = (courseCode: string) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [topics, setTopics] = useState<Topics[]>([]);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		fetch(
			`${process.env.REACT_APP_API_URI}/topic/getTopics/${courseCode}`
		)
			.then((res: Response) => {
				if (!res.ok) throw Error(res.statusText);
				return res.json();
			})
			.then((result) => {
				setTopics(result);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, [courseCode]);

	return {
		topics,
		loading,
		error,
	};
};

export default GetAllTopics;
