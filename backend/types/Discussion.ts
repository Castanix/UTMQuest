import type { WithId, Document, ObjectId } from 'mongodb';

export interface DiscussionType extends WithId<Document> {
	_id: ObjectId;
	question: string;
    op: boolean;
    authId: string; 
    authName: string; 
    content: string;
    date: string; 
    deleted: boolean;
    thread: string[]; 
};


export interface DiscussionFrontEndType {
	_id: string;
	question: string;
	op: boolean;
	authId: string;
	authName: string;
	content: string;
	thread: string[];
	date: string;
	deleted: boolean;
	anon: boolean;
}
