import { ObjectId } from "mongodb";
import { TopicsBackEndType } from "../../types/Topics";
import fs from "fs";
import path from "path";

const mockedTopics: TopicsBackEndType[] = [];

const topicIdName: string[] = [];

export const mockTopics = (numCourses: number, topicsPerCourse: number, qnsPerTopic: number) => {
	for (let i = 0; i < numCourses; i++) {
		for (let j = 0; j < topicsPerCourse; j++) {
			const _id = new ObjectId();
			const topicName = `Topic ${j}`;

			mockedTopics.push({
				_id,
				topicName,
				numQns: qnsPerTopic,
				courseId: `C${i}`,
				deleted: false,
			});

			topicIdName.push(`${_id.toHexString()}, ${topicName}`);
		};
	};

	fs.writeFileSync(
		path.join(__dirname, "../../artillery/topics.csv"),
		topicIdName.join("\n")
	);
};

export default mockedTopics;
