import { ObjectId } from "mongodb";
import { TopicsBackEndType } from "../../types/Topics";

const mockedTopics: TopicsBackEndType[] = [];

export const mockTopics = (numCourses: number, topicsPerCourse: number, qnsPerTopic: number) => {
	for (let i = 0; i < numCourses; i++) {
		for (let j = 0; j < topicsPerCourse; j++) {
			mockedTopics.push({
				_id: new ObjectId(),
				topicName: `Topic ${j}`,
				numQns: qnsPerTopic,
				courseId: `C${i}`,
				deleted: false,
			});
		};
	};
};

export default mockedTopics;
