var mongoose = require("mongoose");

var ConversationSchema = new mongoose.Schema({
	userA: String, //The usernames of the users involved in this conversation
	userB: String,
	lastMessageTime: String, //Timestamp of when the last message was sent (YYYY-MM-DD-HH-MM-SS)
	usersWatching: Number, //Initially 2. Set to 1 when either user in the conversation
							//deletes their copy of the conversation.
							//If deleting a Conversation with oneUserDeleted set to 1,
							//(i.e. the second user in the conversation is deleting their copy of the conversation as well)
							//make sure to delete all the Message objects in the Conversation

	messages: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Message"
		}
	]
}, {
  usePushEach: true
});

module.exports = mongoose.model("Conversation", ConversationSchema);
