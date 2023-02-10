function getRandomPost(context, next) {
    const randomIndex = Math.round(Math.random() * context.vars.resources.length);
    context.vars.discussionId = context.vars.resources[randomIndex].id;
}