import { ObjectId } from "mongodb";
import { qnsTypeEnum, QuestionBackEndType } from "../../types/Questions";
import { TopicsBackEndType } from "../../types/Topics";
import mockedTopics from "./mockTopics";
import mockedAccounts from "./mockAccounts";

const mockedQuestions: QuestionBackEndType[] = [];
let nameCounter = 0;

export const mockQuestions = () => {
	mockedTopics.forEach((topic: TopicsBackEndType) => {
		const someId = new ObjectId();
		const qnsType: qnsTypeEnum =
			nameCounter % 2 === 0 ? qnsTypeEnum.mc : qnsTypeEnum.short;
		const randAccount =
			mockedAccounts[Math.floor(Math.random() * (3 - 1) + 1)];
		const likes = Math.floor(Math.random());

		mockedQuestions.push({
			_id: someId,
			qnsLink: someId.toString(),
			topicId: topic._id,
			topicName: topic.topicName,
			courseId: topic.courseId,
			qnsName: `question${nameCounter}`,
			qnsType,
			description: `description${nameCounter}`,
			explanation: `explanation${nameCounter}`,
			choices: ["A", "B", "C"],
			answers: ["A", "B", "C"][Math.floor(Math.random() * (3 - 1) + 1)],
			utorId: randAccount.utorId,
			utorName: randAccount.utorName,
			userId: randAccount.userId,
			anonId: randAccount.anonId,
			date: new Date().toISOString(),
			numDiscussions: 0,
			anon: nameCounter % 2 === 0,
			latest: true,
			rating: { [randAccount.userId]: likes },
			likes: likes === 1 ? 1 : 0,
			dislikes: likes === 1 ? 0 : 1,
			views: 0,
			viewers: { [randAccount.userId]: 1 },
		});

		nameCounter++;
	});
};

export default mockedQuestions;
