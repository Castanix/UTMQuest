import { ObjectId } from "mongodb";

interface BaseTopicsType {
	topicName: string;
	courseId: string;
	numQns: number;
	deleted: boolean;
}

export interface TopicsFrontEndType extends BaseTopicsType {
	_id: string;
}

export interface TopicsBackEndType extends BaseTopicsType {
	_id: ObjectId;
}
