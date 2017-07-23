var mongoose = require("mongoose");

var MessageSchema = new mongoose.Schema({
	sender: String, //username of sender
	timeSent: String, //YYYY-MM-DD-HH-MM-SS
	messageText: String, //the text of the message
});

module.exports = mongoose.model("Message", MessageSchema);
