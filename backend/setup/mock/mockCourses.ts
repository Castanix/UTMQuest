import { ObjectId } from "mongodb";
import { CoursesBackEndType } from "../../types/Courses";

const mockedCourses: CoursesBackEndType[] = [];

export const mockCourses = async (numCourses: number, numTopics: number) => {
	for (let i = 0; i < numCourses; i++) {
		mockedCourses.push({
			_id: new ObjectId(),
			courseId: `C${i}`,
			courseName: `Course ${i}`,
			numTopics,
			added: i % 2 === 0
		});
	};
};

export default mockedCourses;
