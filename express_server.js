var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser'); // using the cookieparser


const bodyParser = require("body-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set("view engine", "ejs"); // telling the express library to run ejs(embedded javascript) templates to run in a folder called views

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/*app.get("/", (req, res) => { //handles any get method with the url of /
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});*/

app.get("/urls", (req, res) => { //handles any get method to url of /urls and renders the urls_index page & the object of the urldatabase
  let templateVars = { urls: urlDatabase, username: req.cookies['username']};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => { //handles any get method to url of urls/new and renders the file in views/urls_new
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { // handles request method of get and url of urls/:id
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies['username']
   }; //I am also passing the object of our database to compare with the parameter that was given to us by the user
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {

  var url= req.url.replace(/\/u\//i,"");
  if (urlDatabase[url]){
    res.redirect(urlDatabase[url]);
  } else{
    res.send('404 This page does not exist')
  }

});



//Start of POST routers
app.post("/urls", (req, res) => { //Once there is a POST or have values in the body of the request to change the page, this gets invoked for /urls
  var newurl = generateRandomString(); //req.body is an object that has the key of longURL thats assigned by <input> longURL= {longURL:"given URL by user"}
  var newDatabase=addhttp(newurl, req.body);
  res.redirect(`urls/${newurl}`);
});



app.post("/urls/:id/delete", (req,res) =>{ //this handles the post request to any urls/query of the shortened url/delete
  var gettingshorturl = req.body["deleteurl"];
  delete urlDatabase[gettingshorturl];
  res.redirect('/urls');
});


app.post("/urls/:id" , (req, res) => { //handles post method request on any urls/:query
  var updateurl= req.params.id;
  urlDatabase[updateurl] = req.body["newurl"] //changes the database
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('username',req.body['username']);
  res.redirect('/urls');
});

app.post('/logout', (req, res) =>{
  res.clearCookie('username');
  res.redirect('/urls');
});





app.listen(PORT, () => { //listens to port 8080
  console.log(`Example app listening on port ${PORT}!`);
});


// function to generate a random 6 digit alphanumeric value to assign to the url given
function generateRandomString() {
  var characters= "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWVYZ";
  var shorturl= "";

  for(var a=0; a < 6; a++){
    shorturl += characters[Math.floor(Math.random()*characters.length)]; //creates a random name
  }
  return shorturl;

}

function addhttp(newurl,longURL) {

  if (longURL["longURL"].startsWith('http')){
    urlDatabase[newurl] = longURL["longURL"]; //This adds a new key to the database
    return urlDatabase; //returns the newdatabase
  } else {
    urlDatabase[newurl] = 'http://'+longURL["longURL"];
    return urlDatabase;
  }
}