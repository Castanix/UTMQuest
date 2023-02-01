import connectDB, { mongoDBConnection, utmQuestCollections } from "./db.service";


// Soft resets Courses, Topics, Questions, Discussions (without remaking collections and removing indexes)
const softResetDB = async () => {
    await connectDB();

    const session = mongoDBConnection.startSession();

    try {
        session.startTransaction();

        await utmQuestCollections.Questions?.deleteMany({}, { session });
        await utmQuestCollections.Discussions?.deleteMany({}, { session });
        await utmQuestCollections.Topics?.deleteMany({}, { session });

        await utmQuestCollections.Courses?.updateMany(
            { $or: [{ numTopics: { gt: 0 } }, { added: true }] },
            { $set: { numTopics: 0, added: false } },
            { session }
        );

        await session.commitTransaction();


    } catch (err) {
        console.log("Error soft resetting DB");
        await session.abortTransaction();
    } finally {
        console.log("Completed soft reset");
        await session.endSession();
    };
};

softResetDB();