//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// const bcrypt = require('bcrypt');
// const saltRounds = 10; // we should define this when using bcrypt
//const md5 = require('md5');
//const encrypt = require('mongoose-encryption');


const app = express();

//console.log(process.env.API_KEY); this print variables configured in .env file
//environmental variables.

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret : 'Our little secret.',
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true
});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

//const secret = 'Thisisourlittlesecret.';
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});// Always before creating mongoose Model


const User = mongoose.model('User', userSchema);
// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.get('/secrets', function(req, res){
  if(req.isAuthenticated()){
    res.render('secrets');
  } else {
    res.render('login');
  }
}); 

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/register', function(req, res) {

User.register({username : req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect('/register');
  } else {
    passport.authenticate('local')(req, res, function(){
      res.redirect('/secrets');
    });
  }
});




/***** bcrypt ******/
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //   User.findOne({
  //     email: req.body.username
  //   }, function(err, userFound) {
  //     if (!err) {
  //       if (!userFound) {
  //         const newUser = new User({
  //           email: req.body.username,
  //           //password : md5(req.body.password)
  //           password: hash // the hash password generated
  //         });
  //
  //         newUser.save(function(err) {
  //           if (!err) {
  //             res.render('secrets');
  //           } else {
  //             console.log(err);
  //           }
  //         });
  //       } else {
  //         res.redirect('/login');
  //       }
  //     } else {
  //       console.log(err);
  //     }
  //   });
  // });


});

app.post('/login', function(req, res) {

const user = new User({
  username : req.body.username,
  password : req.body.password
});

req.login(user, function(err){
  if(err){
    console.log(err);
  } else {
    passport.authenticate('local')(req, res, function(){
      res.redirect('/secrets');
    });
  }
});


  /**** bcrypt ****/
  // const username = req.body.username;
  // const password = req.body.password;
  //   User.findOne({
  //     email: username
  //   }, function(err, userFound) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       if (userFound) {
  //         bcrypt.compare(password, userFound.password, function(err, result) {
  //           if (result === true) {
  //             res.render('secrets');
  //           }else {
  //             console.log('Not found');
  //             res.redirect('/login');
  //           }
  //         });
  //       } else {
  //         res.redirect('/login');
  //       }
  //     }
  //   });
  //

});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
