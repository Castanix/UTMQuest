/* eslint-disable no-shadow, no-unused-vars */
import { ObjectId } from "mongodb";
import { ReactNode } from "react";

export enum qnsTypeEnum {
	mc = "mc",
	matching = "matching",
	short = "short",
}

export enum qnsStatusType {
	approved = "approved",
	pending = "pending",
}

export interface TypeOfQuestion { 
	mc: ReactNode,
	short: ReactNode
}

export interface QuestionsType {
	_id: string;
	qnsId: string;
	topicId: string;
	topicName: string;
	courseId: string;
	qnsName: string;
	qnsStatus: qnsStatusType;
	reviewStatus: number;
	qnsType: qnsTypeEnum;
	desc: string;
	xplan: string;
	choices: string[];
	ans: string;
	authId: string;
	authName: string;
	date: string;
	numDiscussions: number;
	snapshort: ObjectId | null;
}

