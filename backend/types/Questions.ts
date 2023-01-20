/* eslint-disable no-shadow, no-unused-vars */

export enum qnsTypeEnum {
	mc = "mc",
	short = "short",
}

export interface QuestionsType {
	_id: string;
	qnsLink: string;
	topicId: string;
	topicName: string;
	courseId: string;
	qnsName: string;
	qnsType?: qnsTypeEnum;
	description: string;
	explanation: string;
	choices: string[];
	answers: string[] | string;
	authId: string;
	authName: string;
	date: string;
	numDiscussions: number;
	anon: boolean;
	latest: boolean;
	rating: { [utorId: string]: number };
	likes: number;
	dislikes: number;
	views: number;
	viewers: { [utorId: string]: number };
}
