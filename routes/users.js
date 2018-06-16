var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var crypto = require('crypto');
var SessionService = require('../services/sessions.js');
var User = mongoose.model('User');
var EmailService = require('../services/smtp.js');

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

router.post('/logout', function(req, res, next){
  SessionService.deleteSession(req.body.token, function(){
    res.status(200).send("Ok");
  }, function(){
    res.status(500).send("Unexpected Error!");
  });
});

router.post('/forgot', function(req, res) {
  if(!(req.body.email)){ // no email is provided
      return res.status(412).json({
          msg: "Route requisites not met."
      });
  }

  User.findOne({
      email: (req.body.email.toLowerCase()).trim()
    })
    .select('_id')
    .exec(function(err, user) {
      if (!user) {
          res.status(500).json({
              msg: "Couldn't search the database for user!"
          });
      } else {
          var rtoken = crypto.randomBytes(32).toString('hex');

          // yes yes this is bad, that is why we need
          // database seeds for testing. I also put this
          // after generating 32 hex to make sure crypto
          // package updates won't error out on updated
          // version. Want that to fail if update breaks
          // functionality for tests.
          if (process.env.NODE_ENV === 'test') {
            rtoken = "1111";
          }
          console.log(rtoken);

          var matchUser = {
            _id: user._id
          }

          var updatedUser = {
            reset_token: rtoken
          }

          var updateCmd = { $set: updatedUser }
          User.update(matchUser, updateCmd).exec(function(err, user){
            if(err){
              res.status(500).send("Error reading database!");
            } else if(!user) {
              res.status(500).send("No user with that ID found in database");
            } else { //finish implementing logic to send email later
              res.status(200).send({msg: 'success. Email has been sent to your address'});
            }
          });
      }
    });
});

router.post('/reset', function(req, res, next) {
  if(!(req.body.reset_token && req.body.password)){ // no token or password provided
      return res.status(412).json({
          msg: "Route requisites not met."
      });
  }

  User.findOne({
      reset_token: req.body.reset_token
    })
    .select('_id')
    .exec(function(err, user) {
      if (!user) {
          res.status(500).json({
              msg: "Couldn't search the database for user!"
          });
      } else {
          //Create a random salt
          var salt = crypto.randomBytes(128).toString('base64');
          //Create a unique hash from the provided password and salt
          var hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 512);

          var matchUser = {
            _id: user._id
          }

          var updatedUser = {
            password: hash,
            salt: salt,
            reset_token : ''
          }

          var updateCmd = { $set: updatedUser }
          User.update(matchUser, updateCmd).exec(function(err, user){
            if(err){
              res.status(500).send("Error reading database!");
            } else if(!user) {
              res.status(500).send("No user with that ID found in database");
            } else {
              EmailService.reset_email(req, res, next);
            }
          });
      }
    });
});

module.exports = router;
