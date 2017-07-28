var express = require("express");
var app = express();
var nunjucks = require("nunjucks");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var Conversation = require("./models/conversation");
var Message = require("./models/message");
var messageRoutes = require("./routes/messages");
var indexRoutes = require("./routes/index");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
	secret: "blah blah top secret :D",
	resave: false,
	saveUninitialized: false
}));

//Configure Nunjucks
nunjucks.configure("views", {
    autoescape: true,
    express: app
});

//Connect the database
//mongoose.connect('mongodb://localhost/messaging_app_db');
mongoose.connect('mongodb://user:as98yuhk3jn435n3rryitxcvcvrwtq@ds127173.mlab.com:27173/messaging_app');
//Set up Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
app.use(indexRoutes);
app.use(messageRoutes);

//Listen on Port 3000
app.listen(3000, function(){
	console.log("Listening on port 3000!")
});
