import { ObjectId } from "mongodb";
import mockedCourses from "./mockCourses";
import { TopicsBackEndType } from "../../types/Topics";

const mockedTopics: TopicsBackEndType[] = [];
let counter = 0;

export const mockTopics = () => {
	mockedCourses.forEach((course) => {
		mockedTopics.push({
			_id: new ObjectId(),
			topicName: `topic${counter}`,
			numQns: 0,
			courseId: course.courseId,
			deleted: false,
		});
		mockedTopics.push({
			_id: new ObjectId(),
			topicName: `topic${counter + 1}`,
			numQns: 0,
			courseId: course.courseId,
			deleted: false,
		});
		mockedTopics.push({
			_id: new ObjectId(),
			topicName: `topic${counter + 2}`,
			numQns: 0,
			courseId: course.courseId,
			deleted: false,
		});
		counter += 3;
	});
};

export default mockedTopics;
