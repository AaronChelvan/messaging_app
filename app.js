var express = require("express");
var app = express();
var nunjucks = require("nunjucks");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
var messageRoutes = require("./routes/messages");
var authRoutes = require("./routes/auth");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
	secret: process.env.EXPRESS_SECRET,
	resave: false,
	saveUninitialized: false
}));

//Configure Nunjucks
nunjucks.configure("views", {
    autoescape: true,
    express: app
});

//Connect the database
mongoose.connect(process.env.DB_URL, {
    useMongoClient: true,
});
//Set up Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
app.use(authRoutes);
app.use(messageRoutes);

//Listen on Port 8000
app.listen(process.env.PORT || 8000, function(){
	console.log("Listening on port 8000!")
});
