/* eslint-disable no-shadow, no-unused-vars */

import { ObjectId } from "mongodb";

export enum qnsTypeEnum {
	mc = "mc",
	short = "short",
}

interface BaseQuestionType {
	qnsLink: string;
	topicName: string;
	courseId: string;
	qnsName: string;
	qnsType?: qnsTypeEnum;
	description: string;
	explanation: string;
	choices: string[];
	answers: string[] | string;
	userId: string;
	anonId: string;
	utorName: string;
	date: string;
	numDiscussions: number;
	anon: boolean;
	latest: boolean;
	rating: { [userId: string]: number };
	likes: number;
	dislikes: number;
	views: number;
	viewers: { [userId: string]: number };
	score: number;
}

export interface QuestionBackEndType extends BaseQuestionType {
	_id: ObjectId;
	topicId: ObjectId;
	utorId: string;
}

export interface QuestionFrontEndType extends BaseQuestionType {
	_id: string;
	topicId: string;
}
