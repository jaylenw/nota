var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var crypto = require('crypto');
var SessionService = require('../services/sessions.js');
var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Not enabled yet :)');
});

router.post('/register', function(req, res) {
    if(!(req.body.email &&
        req.body.password)){
        return res.status(412).json({
            msg: "Route requisites not met."
        });
    }

    var cleanEmail = (req.body.email.toLowerCase()).trim();
    var emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
    if (!emailRegex.test(cleanEmail)) {
        res.status(406).json({
          msg: "Email is not valid!"
        });
    } else {
        //Check if a user with that username already exists
        User.findOne({
            email: cleanEmail
          })
          .select('_id')
          .exec(function(err, user) {
            if (user) {
                res.status(409).json({
                    msg: "Email taken!"
                });
            } else {
                //Create a random salt
                var salt = crypto.randomBytes(128).toString('base64');
                //Create a unique hash from the provided password and salt
                var hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 512);
                //Create a new user with the assembled information
                var newUser = new User({
                    email: cleanEmail,
                    password: hash,
                    salt: salt
                }).save(function(err, newUser) {
                    if (err) {
                      console.log("Error saving user to DB!");
                      res.status(500).json({
                          msg: "Error saving user to DB!"
                      });
                    } else {
                        SessionService.generateSession(newUser._id, "user", function(token){
                            //All good, give the user their token
                            res.status(201).json({
                                token: token
                            });
                        }, function(err){
                            res.status(err.status).json(err);
                        });
                    }
                });
            }
          });
    }
});

router.post('/login', function(req, res, next) {
    if(!(req.body.email &&
        req.body.password)){
        return res.status(412).json({
            msg: "Route requisites not met."
        });
    }

    //Find a user with the username requested. Select salt and password
    User.findOne({
        email: (req.body.email.toLowerCase()).trim()
    })
    .select('password salt')
    .exec(function(err, user) {
        if (err) {
            res.status(500).json({
                msg: "Couldn't search the database for user!"
            });
        } else if (!user) {
            res.status(401).json({
                msg: "Wrong email!"
            });
        } else {
          console.log(user.salt)
            //Hash the requested password and salt
            var hash = crypto.pbkdf2Sync(req.body.password, user.salt, 10000, 512);

            //Compare to stored hash
            if (hash == user.password) {
                SessionService.generateSession(user._id, "user", function(token){
                    //All good, give the user their token
                    res.status(200).json({
                        token: token
                    });
                }, function(err){
                    res.status(err.status).json(err);
                });
            } else {
                res.status(401).json({
                    msg: "Password is incorrect!"
                });
            }
        }
    });
});

module.exports = router;
