//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; // we should define this when using bcrypt
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

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//const secret = 'Thisisourlittlesecret.';
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});// Always before creating mongoose Model


const User = mongoose.model('User', userSchema);


app.get('/', function(req, res) {
  res.render('home');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    User.findOne({
      email: req.body.username
    }, function(err, userFound) {
      if (!err) {
        if (!userFound) {
          const newUser = new User({
            email: req.body.username,
            //password : md5(req.body.password)
            password: hash // the hash password generated
          });

          newUser.save(function(err) {
            if (!err) {
              res.render('secrets');
            } else {
              console.log(err);
            }
          });
        } else {
          res.redirect('/login');
        }
      } else {
        console.log(err);
      }
    });
  });


});

app.post('/login', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
    User.findOne({
      email: username
    }, function(err, userFound) {
      if (err) {
        console.log(err);
      } else {
        if (userFound) {
          bcrypt.compare(password, userFound.password, function(err, result) {
            if (result === true) {
              res.render('secrets');
            }else {
              console.log('Not found');
              res.redirect('/login');
            }
          });
        } else {
          res.redirect('/login');
        }
      }
    });


});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
