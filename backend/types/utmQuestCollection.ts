import * as mongoDB from "mongodb";

export type UTMQuestCollections = {
	Accounts?: mongoDB.Collection;
	Courses?: mongoDB.Collection;
	Topics?: mongoDB.Collection;
	Questions?: mongoDB.Collection;
	Discussions?: mongoDB.Collection;
	Badges?: mongoDB.Collection;
};
