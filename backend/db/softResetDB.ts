import connectDB, {
	mongoDBConnection,
	utmQuestCollections,
} from "./db.service";

// Soft resets Accounts, Badges, Courses, Topics, Questions, Discussions (without remaking collections and removing indexes)
const softResetDB = async () => {
	await connectDB();

	const session = mongoDBConnection.startSession();

	try {
		session.startTransaction();

		await Promise.all([
			utmQuestCollections.Accounts?.deleteMany({}, { session }),
			utmQuestCollections.Badges?.deleteMany({}, { session }),
			utmQuestCollections.Questions?.deleteMany({}, { session }),
			utmQuestCollections.Discussions?.deleteMany({}, { session }),
			utmQuestCollections.Topics?.deleteMany({}, { session }),
			utmQuestCollections.Courses?.updateMany(
				{ $or: [{ numTopics: { gt: 0 } }, { added: true }] },
				{ $set: { numTopics: 0, added: false } },
				{ session }
			)
		]).then(async () => {
			await session.commitTransaction();
			console.log("Completed soft reset");
		}).catch(err => {
			throw new Error(err);
		});

	} catch (err) {
		console.log("Error soft resetting DB");
		console.log(err);
		await session.abortTransaction();
	} finally {
		await session.endSession();
		mongoDBConnection.close();
	}
};

softResetDB();
