var express = require("express");
var app = express();
var nunjucks = require("nunjucks");

//Configure Nunjucks
nunjucks.configure("views/", {
    autoescape: true,
    express: app
});

app.get("/", function (req, res) {
  res.render("index.html");
});

app.get("\*", function(req, res) {
    res.render("error.html");
});

app.listen(3000, function () {
  console.log('Listening on port 3000!')
});
