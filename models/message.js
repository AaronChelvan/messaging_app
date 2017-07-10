var mongoose = require("mongoose");

var MessageSchema = new mongoose.Schema({
	sender: String, //username of sender
	recipient: String, //username of recipient
	dateTimeReceived: String, //YYYY-MM-DD-HH-MM-SS
	message: String
});

module.exports = mongoose.model("Message", MessageSchema);
