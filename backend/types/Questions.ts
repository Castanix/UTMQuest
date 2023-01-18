/* eslint-disable no-shadow, no-unused-vars */

export enum qnsTypeEnum {
	mc = "mc",
	short = "short",
}

export interface QuestionsType {
	_id: string;
	link: string;
	topicId: string;
	topicName: string;
	courseId: string;
	qnsName: string;
	qnsType?: qnsTypeEnum;
	desc: string;
	xplan: string;
	choices: string[];
	ans: string[] | string;
	authId: string;
	authName: string;
	date: string;
	numDiscussions: number;
	anon: boolean;
	latest: boolean;
	rating: { [utorid: string]: number };
	likes: number;
	dislikes: number;
	views: number;
	viewers: { [utorid: string]: number };
}
