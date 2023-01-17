/* eslint-disable no-shadow, no-unused-vars */

export enum qnsTypeEnum {
	mc = "mc",
	short = "short",
}

interface rating {
	utorid?: number;
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
	rating: rating;
	views: number;
	likes: number;
	dislikes: number;
}
