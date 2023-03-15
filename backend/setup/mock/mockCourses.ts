import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { CoursesBackEndType } from "../../types/Courses";

const mockedCourses: CoursesBackEndType[] = [];
const courseIds: string[] = [];

export const mockCourses = async (numCourses: number, numTopics: number, numQns: number) => {
	for (let i = 0; i < numCourses; i++) {
		const isAdded = i % 2 === 0;

		mockedCourses.push({
			_id: new ObjectId(),
			courseId: `C${i}`,
			courseName: `Course ${i}`,
			numTopics,
			numQns,
			added: isAdded,
		});

		if (isAdded) courseIds.push(`C${i}`);
	}

	fs.writeFileSync(
		path.join(__dirname, "../../artillery/courses.txt"),
		courseIds.join("\n")
	);
};

export default mockedCourses;
