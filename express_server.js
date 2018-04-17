var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => { //handles any get method with the url of /
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => { //handles any get method with the url of /urls.json
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => { //handles any get method with the url of /hello
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => { //listens to port 8080
  console.log(`Example app listening on port ${PORT}!`);
});