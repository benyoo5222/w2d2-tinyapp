var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); // telling the express library to run ejs(embedded javascript) templates to run in a folder called views

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => { //handles any get method with the url of /
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => { //handles any get method to url of /urls and renders the urls_index page & the object of the urldatabase
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => { //handles any get method with the url of /urls.json
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => { //handles any get method to url of urls/new and renders the file in views/urls_new
  res.render("urls_new");
});

app.get("/hello", (req, res) => { //handles any get method with the url of /hello
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {

  for(var key in urlDatabase){ // looks at the key in the database
    if(req.path.replace(/\/u\//i,"") === key){ //replaces the '/u/' infront of the url that was requested
      let longURL= urlDatabase[key]; // setting the longURL or the proper url as the value of the key that matches the requested url
      if (longURL.search(/www./i) < 0) { //if there is no www.
        longURL = "www." + longURL; // add www. ifront of the proper url
        if (longURL.search(/https:\//i) < 0){ // if there was no https:// infront of the url
          longURL= "https://"+longURL; //add the https:// infront of the url
          res.redirect(longURL); // redirects to the url
        } else {
          res.redirect(longURL); // redirects to the url
        }
      } else { // saying that there is www. infront of the url
        if (longURL.search(/https:\//i) < 0){ // if there was no https:// infront of the url
          longURL= "https://"+longURL; //add the https:// infront of the url
          res.redirect(longURL); // redirects to the url
        } else {
          res.redirect(longURL); // redirects to the url
        }
      }
    } else {
      res.send('404');
    }
  }
});

app.get("/urls/:id", (req, res) => { // handles request method of get and url of urls/:id
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase }; //I am also passing the object of our database to compare with the parameter that was given to us by the user
  res.render("urls_show", templateVars);
});

//Start of POST routers
app.post("/urls", (req, res) => { //Once there is a POST or have values in the body of the request to change the page, this gets invoked for /urls
  var newurl= generateRandomString(req.body); //req.body is an object that has the key of longURL thats assigned by <input> longURL= {longURL:"given URL by user"}
  for(var key in newurl){ //newurl is the newDataBase of the new added key and key represents each key in the new database
    if(newurl[key] === req.body["longURL"]){ // if the object of the req.body of the key of "longURL" equals the value in the newdatabase
      res.redirect(`/urls/${key}`); //it will be redirected with the new shortened name
    }
  }
});



app.listen(PORT, () => { //listens to port 8080
  console.log(`Example app listening on port ${PORT}!`);
});


// function to generate a random 6 digit alphanumeric value to assign to the url given
function generateRandomString(longURL) {
  var characters= "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWVYZ";
  var shorturl= "";

  for(var a=0; a < 6; a++){
    shorturl += characters[Math.floor(Math.random()*characters.length)]; //creates a random name
  }
  urlDatabase[shorturl] = longURL["longURL"]; //This adds a new key to the database
  return urlDatabase; //returns the newdatabase
}