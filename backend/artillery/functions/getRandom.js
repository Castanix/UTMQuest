function updateData(context, events, done) {
    const { utorId, userId, anonId, content, thread, opDate, editDate, deleted, anon, edited } = context.vars.discussionDoc;

    context.vars.oldUtorId = utorId;
    context.vars.oldUserId = userId;
    context.vars.oldAnonId = anonId;
    context.vars.oldContent = content;
    context.vars.newThread = [...thread, context.vars.discussionResult.insertedId];
    context.vars.oldOpDate = opDate;
    context.vars.oldEditDate = editDate;
    context.vars.oldDeleted = deleted;
    context.vars.oldAnon = anon;
    context.vars.oldEdited = edited

    return done();
};

function getRandomPost(context, events, done) {
    const randomIndex = Math.round(Math.random() * (context.vars.opPosts.discussion.length - 1));
    context.vars.discussionId = context.vars.opPosts.discussion[randomIndex]._id;
    return done();
};

function getRandomThink(context, events, done) {
    let randomThink = Math.floor(Math.random() * 26) + 5;
    if (randomThink > 25) randomThink = Math.floor(Math.random() * 26) + 5;

    context.vars.thinkTime = randomThink;
    return done();
};

function setRandomStudyAmount(context, events, done) {
    let randomAmount = Math.floor(Math.random() * 21) + 3;

    context.vars.studyAmount = randomAmount;
    return done();
};

module.exports = {
    updateData: updateData,
    getRandomPost: getRandomPost,
    getRandomThink: getRandomThink,
    setRandomStudyAmount: setRandomStudyAmount,
};