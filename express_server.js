var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser'); // using the cookieparser
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var password = ""; // you will probably this from req.params
var cookieSession = require('cookie-session')


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

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
  let templateVars = { urls: urlDatabase, cookieid: cookieidchecker(req) }; //cookieid at the very bottom; checks if there is a cookie and if there is it sends back that person's user info
  res.render("urls_index", templateVars);
})

app.get("/urls", (req, res) => { //handles any get method to url of /urls and renders the urls_index page & the object of the urldatabase
  let templateVars = { urls: urlDatabase, cookieid: cookieidchecker(req)};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => { //handles any get method to url of urls/new and renders the file in views/urls_new

  if(cookieidchecker(req)){ // if there is a cookie in the browser you can use the app
    res.render("urls_new");
  } else {
    res.redirect('/login'); // if you there is no cookie you gotta first login!!!!
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

  var url= req.url.replace(/\/u\//i,""); // I am removing /u/ infront of the query that was given
  if (urlDatabase[url]){ // if that short url exist in my databse of urls
    res.redirect(urlDatabase[url].website); //then it will redirect you to the website
  } else{
    res.send('404 This page does not exist') //if that short url does not exist in the database, it will send 404
  }

});

app.get('/register', (req, res) => { //register page
  res.render('register');
});

app.get('/login', (req, res) =>{
  res.render('login'); // renders the ejs file called login
});




//Start of POST routers
app.post("/urls", (req, res) => { //Once there is a POST or have values in the body of the request to change the page, this gets invoked for /urls
  var newurl = generateRandomString(); //req.body is an object that has the key of longURL thats assigned by <input> longURL= {longURL:"given URL by user"}
  var newDatabase=addhttp(newurl, req.body, req); //once the database has been updated

  res.redirect(`urls/`); //redirects you to home page to see your beautiful creation.
});



app.post("/urls/:id/delete", (req,res) =>{ //this handles the post request to any urls/query of the shortened url/delete

  if(req.session.user_id && req.session.user_id == urlDatabase[req.body['deleteurl']].userID){ // if the cookie is defined and that cookie matches the user id then they can delete
  var gettingshorturl = req.body["deleteurl"];
  delete urlDatabase[gettingshorturl];
  res.redirect('/urls');
  return ;
  }
  res.send('You cannot delete other URLS'); // otherwise they cannot delete it
});


app.post("/urls/:id" , (req, res) => { //handles post method request on any urls/:query
  if(req.session.user_id && req.session.user_id == urlDatabase[req.params.id].userID){ //if the session cookie is defined and if that cookie id exist as a key in the databse (thats why req.params.id is neccesary to find out the shortened url key name)
  var updateurl = req.params.id; //we are saying that updateurl is ooing to be the shortned url query
  urlDatabase[updateurl].website = req.body["newurl"] //changes the database of that shortened url's website to whatever the user changed it to (the req.body will show what the user inputted in the form)
  res.redirect('/urls'); //then it redirect to the main page to show the updated list
  return ;
  }
  res.send('This is not your URL!');
});


app.post('/logout', (req, res) =>{
  req.session.user_id = null; // we get rid of the cookie by setting it to null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {// registration page

  var randomid= generateRandomString();
  if(req.body['email'] && req.body['password']){ //if the email and password field is NOT empty
    for(var key in users){
      if(users[key].email == req.body['email']){ // if the user requested email is equal to any email that exists in my users database
        res.send('404 existing email'); // we send the user a message saying this email already exists
        return ;
      }
    }
    password = bcrypt.hashSync(req.body['password'],10);

    users[randomid]={ //created a new key and object within the database object
        id: randomid,
        email: req.body['email'],
        password: password
        };

    req.session.user_id = users[randomid].id; // we set the cookie equal to the id of the randomly generated id we set for the user
    res.redirect('/');
    return ;
  } else {
    res.send('404 please write valid email and password');
  }

});

app.post('/login', (req, res) => { // handles the form of the login page
  for(var key in users){
   if(users[key].email == req.body['email'] && bcrypt.compareSync(req.body['password'], users[key].password)) { // only if the email and the password both match the user database
    req.session.user_id = users[key].id; // the cookie is reset to the id of the matched user
    res.redirect('/urls');
    return ; //this is here to stop the function once its done
    }
  }
    res.send('403 no match');
});


app.listen(PORT, () => { //listens to port 8080
  console.log(`Example app listening on port ${PORT}!`);
});


// function to generate a random 6 digit alphanumeric value to assign to the url given

function generateRandomString() { // generates a random 6 digit value

  var characters= "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWVYZ";
  var shorturl= "";

  for(var a = 0; a < 6; a++){
    shorturl += characters[Math.floor(Math.random() * characters.length)]; //creates a random name
  }
  return shorturl;

}

function addhttp(newurl,longURL,req) { //adds http infront of the url


  if (longURL["longURL"].startsWith('http')){ //if the url given has http infron of it
    urlDatabase[newurl] = {};
    urlDatabase[newurl].website = longURL["longURL"]; //This adds a new key to the database and just adds the url to a key called website
    urlDatabase[newurl].userID = req.session.user_id;

    return urlDatabase; //returns the newdatabase
  } else {
    urlDatabase[newurl] = {};
    urlDatabase[newurl].website = 'http://'+longURL["longURL"]; // else add http:// infront of the website
    urlDatabase[newurl].userID = req.session.user_id;

    return urlDatabase;
  }
}

function cookieidchecker(req){ //this checks if there is a cookie sent to browser

  for(var key in users){
    if(key == req.session.user_id){ // if any of the users random id matches the cookie sent to the browser
      return users[key]; // we will return the object of that user's info
    }
  }
}



