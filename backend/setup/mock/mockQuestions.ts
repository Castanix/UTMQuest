import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { qnsTypeEnum, QuestionBackEndType } from "../../types/Questions";
import { TopicsBackEndType } from "../../types/Topics";
import mockedTopics from "./mockTopics";
import mockedAccounts from "./mockAccounts";

const mockedQuestions: QuestionBackEndType[] = [];

const questionLinks: string[] = [];

export const mockQuestions = (qnsPerTopic: number) => {
	mockedTopics.forEach((topic: TopicsBackEndType, index: number) => {
		for (let i = 0; i < qnsPerTopic; i++) {
			const someId = new ObjectId();
			const qnsType: qnsTypeEnum =
				index % 2 === 0 ? qnsTypeEnum.mc : qnsTypeEnum.short;
			const randAccount =
				mockedAccounts[Math.floor(Math.random() * 3)];
			const likes = Math.floor(Math.random());

			const answer = ["A", "B", "C"][
				Math.floor(Math.random() * 3)
			];

			const isAnon = Math.random() < 0.25;

			mockedQuestions.push({
				_id: someId,
				qnsLink: someId.toString(),
				topicId: topic._id,
				topicName: topic.topicName,
				courseId: topic.courseId,
				qnsName: `Question ${index}${i}`,
				qnsType,
				description: `Description ${index} ${i}`,
				explanation: `Explanation ${index} ${i}`,
				choices: qnsType === qnsTypeEnum.short ? [] : ["A", "B", "C"],
				answers:
					qnsType === qnsTypeEnum.short
						? `${index} ${i} ${answer}`
						: [answer],
				utorId: randAccount.utorId,
				utorName: isAnon ? "Anonymous" : randAccount.utorName,
				userId: randAccount.userId,
				anonId: randAccount.anonId,
				date: new Date().toISOString(),
				numDiscussions: 0,
				anon: isAnon,
				latest: true,
				rating: { [randAccount.userId]: likes },
				likes: likes === 1 ? 1 : 0,
				dislikes: likes === 1 ? 0 : 1,
				views: 0,
				viewers: { [randAccount.userId]: 1 },
			});

			questionLinks.push(someId.toString());
		}
	});

	fs.writeFileSync(
		path.join(__dirname, "../../artillery/questions.txt"),
		questionLinks.join("\n")
	);
};

export default mockedQuestions;
