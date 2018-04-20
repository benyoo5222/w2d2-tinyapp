var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser'); // using the cookieparser
const bodyParser = require("body-parser");


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set("view engine", "ejs"); // telling the express library to run ejs(embedded javascript) templates to run in a folder called views

//Start of databases

var urlDatabase = {
  "b2xVn2":
  {
    website:"http://www.lighthouselabs.ca",
    userid: "blah"

  },
  "9sm5xK":
  {
    website: "http://www.google.com",
    userid: "blah2"
  }
};

const users = {
  user1: {
    id: 'beny',
    email: 'benyoo@gmail.com',
    password: "purple-monkey-dinosaur"
  },
 user2: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }

}


// Start of get requests routers

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/", (req, res) => { //handles any get method with the url of /
  let templateVars = { urls: urlDatabase, cookieid: cookieidchecker(req) };
  res.render("urls_index", templateVars);
})

app.get("/urls", (req, res) => { //handles any get method to url of /urls and renders the urls_index page & the object of the urldatabase
  let templateVars = { urls: urlDatabase, cookieid: cookieidchecker(req)};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => { //handles any get method to url of urls/new and renders the file in views/urls_new

  if(cookieidchecker(req)){
    res.render("urls_new");
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:id", (req, res) => { // handles request method of get and url of urls/:id
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    web: urlDatabase[req.params.id],
    cookieid: cookieidchecker(req)
   }; //I am also passing the object of our database to compare with the parameter that was given to us by the user
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {

  var url= req.url.replace(/\/u\//i,"");
  if (urlDatabase[url]){
    res.redirect(urlDatabase[url].website);
  } else{
    res.send('404 This page does not exist')
  }

});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) =>{
  res.render('login'); // renders the ejs file called login
});


//Start of POST routers
app.post("/urls", (req, res) => { //Once there is a POST or have values in the body of the request to change the page, this gets invoked for /urls
  var newurl = generateRandomString(); //req.body is an object that has the key of longURL thats assigned by <input> longURL= {longURL:"given URL by user"}
  var newDatabase=addhttp(newurl, req.body, req.cookies);

  res.redirect(`urls/${newurl}`);
});



app.post("/urls/:id/delete", (req,res) =>{ //this handles the post request to any urls/query of the shortened url/delete

  if(req.cookies['user_id'] && req.cookies['user_id'] == urlDatabase[req.body['deleteurl']].userID){
  var gettingshorturl = req.body["deleteurl"];
  delete urlDatabase[gettingshorturl];
  res.redirect('/urls');
  }
  res.send('You cannot delete other URLS');


});


app.post("/urls/:id" , (req, res) => { //handles post method request on any urls/:query
  if(req.cookies['user_id'] && req.cookies['user_id'] == urlDatabase[req.params.id].userID){
  var updateurl= req.params.id;
  urlDatabase[updateurl].website = req.body["newurl"] //changes the database
  res.redirect('/urls');
  }
  res.send('This is not your URL!');
});


app.post('/logout', (req, res) =>{
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {


  /*if(req.body['email'] && req.body['password']){

    for(var key in users){ //gets the keys for person in the database
      if(users[key].email == req.body['email']){ // if there is an email in the database already
        res.send('This email is already taken please use another email'); //im telling the user to register another one
      } else{
      if(users[key].email != req.body['email']){
        var randomid= generateRandomString(); //generates a random id so that i can assign it to a varibale so it points to one value;

        users[randomid]={ //created a new key and object within the database object
        id: randomid,
        email: req.body['email'],
        password: req.body['password']
        };

        }
      }
    }
    res.cookie('user_id', users[randomid].id);
    res.redirect('/');
     //once all the checks are done, I send the user a cookie with their unique user id
     //once its successful it redirects to the main page

  } else if(!req.body['email']){
    res.send('404 Please write a valid email.');
  } else if(!req.body['password']){
    res.send('404 Please fill in a password.');
  }*/

  var randomid= generateRandomString();

  if(req.body['email'] && req.body['password']){
    for(var key in users){
      if(users[key].email == req.body['email']){
        res.send('404 existing email');
      }
    }

    users[randomid]={ //created a new key and object within the database object
        id: randomid,
        email: req.body['email'],
        password: req.body['password']
        };
        res.cookie('user_id', users[randomid].id);
        res.redirect('/');
     //generates a random id so that i can assign it to a varibale so it points to one value
  } else {
    res.send('404 please write valid email and password');
  }

});

app.post('/login', (req, res) => {

  for(var key in users){
   if(users[key].email == req.body['email'] && users[key].password == req.body['password']) {
    res.cookie('user_id', users[key].id);
    res.redirect('/urls');
    return ;
    }
  }
    res.send('403 no match');
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

function addhttp(newurl,longURL,cookies) {


  if (longURL["longURL"].startsWith('http')){
    urlDatabase[newurl] = {};
    urlDatabase[newurl].website = longURL["longURL"]; //This adds a new key to the database
    urlDatabase[newurl].userID = cookies['user_id'];

    return urlDatabase; //returns the newdatabase
  } else {
    urlDatabase[newurl] = {};
    urlDatabase[newurl].website = 'http://'+longURL["longURL"];
    urlDatabase[newurl].userID = cookies['user_id'];

    return urlDatabase;
  }
}

function cookieidchecker(req){

  for(var key in users){
    if(key == req.cookies['user_id']){
      return users[key];
    }
  }
}

/*function emailpasswordchecker(req, res,){

  for(var key in users){
   if(users[key].email == req.body['email'] && users[key].password == req.body['password']) {
    res.cookie('user_id', users[key].id);
    res.redirect('/urls');
    res.end();
    }
  }
    res.send('403 no match');


}*/


