const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const SessionService = require('../services/sessions.js');
const User = mongoose.model('User');
const EmailService = require('../services/mailgun.js');

/* GET users listing. */
router.get('/', function(req, res) {
	res.send('Not enabled yet :)');
});

router.post('/register', function(req, res, next) {
	if(!(req.body.email &&
        req.body.password)){
		return res.status(412).json({
			msg: 'Route requisites not met.'
		});
	}

	let cleanEmail = (req.body.email.toLowerCase()).trim();
	let emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
	if (!emailRegex.test(cleanEmail)) {
		res.status(406).json({
			msg: 'Email is not valid!'
		});
	} else {
		//Check if a user with that username already exists
		User.findOne({
			email: {$eq: cleanEmail}
		})
			.select('_id')
			.exec(function(err, user) {
				if (user) {
					res.status(409).json({
						msg: 'Email taken!'
					});
				} else {
					//Create a random salt
					let salt = crypto.randomBytes(128).toString('base64');
					//Create a unique hash from the provided password and salt
					let hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 512, 'sha512');
					//Create a new user with the assembled information
					User({
						email: cleanEmail,
						password: hash,
						salt: salt
					}).save(function(err, newUser) {
						if (err) {
							console.log('Error saving user to DB!');
							res.status(500).json({
								msg: 'Error saving user to DB!'
							});
						} else {
							SessionService.generateSession(newUser._id, 'user', function(token){

								// All good, give the user their token
								res.status(201).json({
									token: token
								});
								req.body.email = cleanEmail;
								next(); // sent respose but now would like to send email
								// it is okay to call email after the response as it is not
								// breaking the flow for the user. And technically
								// you can call next() after sending a response
							}, function(err){
								res.status(err.status).json(err);
							});
						}
					});

				}
			});
	}
}, EmailService.welcome_email);

router.post('/login', function(req, res) {
	if(!(req.body.email &&
        req.body.password)){
		return res.status(412).json({
			msg: 'Route requisites not met.'
		});
	}

	//Find a user with the username requested. Select salt and password
	User.findOne({
		email: {$eq: (req.body.email.toLowerCase()).trim()}
	})
		.select('password salt')
		.exec(function(err, user) {
			if (err) {
				res.status(500).json({
					msg: 'Couldn\'t search the database for user!'
				});
			} else if (!user) {
				res.status(401).json({
					msg: 'Wrong email!'
				});
			} else {
				//Hash the requested password and salt
				let hash = crypto.pbkdf2Sync(req.body.password, user.salt, 10000, 512, 'sha512');

				//Compare to stored hash
				if (hash == user.password) {
					SessionService.generateSession(user._id, 'user', function(token){
						//All good, give the user their token
						res.status(200).json({
							token: token
						});
					}, function(err){
						res.status(err.status).json(err);
					});
				} else {
					res.status(401).json({
						msg: 'Password is incorrect!'
					});
				}
			}
		});
});

router.post('/logout', function(req, res){
	SessionService.deleteSession(req.body.token, function(){
		res.status(200).send('Ok');
	}, function(){
		res.status(500).send('Unexpected Error!');
	});
});

router.post('/forgot', function(req, res, next) {

	if(!(req.body.email)){ // no email is provided
		return res.status(412).json({
			msg: 'Route requisites not met.'
		});
	}
	let modified_email = (req.body.email.toLowerCase()).trim();
	User.findOne({
		email: {$eq: modified_email}
	})
		.select('_id')
		.exec(function(err, user) {
			if (!user) {
				res.status(500).json({
					msg: 'Couldn\'t search the database for user!'
				});
			} else {
				let rtoken = crypto.randomBytes(32).toString('hex');

				// yes yes this is bad, that is why we need
				// database seeds for testing. I also put this
				// after generating 32 hex to make sure crypto
				// package updates won't error out on updated
				// version. Want that to fail if update breaks
				// functionality for tests.
				if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
					rtoken = '1111';
				}
				console.log(rtoken);

				let matchUser = {
					_id: user._id
				};

				let updatedUser = {
					reset_token: rtoken
				};

				let updateCmd = { $set: updatedUser };
				User.update(matchUser, updateCmd).exec(function(err, user){
					if(err){
						res.status(500).send('Error reading database!');
					} else if(!user) {
						res.status(500).send('No user with that ID found in database');
					} else {
						req.body.email = modified_email;
						req.body.rtoken = rtoken;
						next();
					}
				});
			}
		});
}, EmailService.forgot_email);

router.post('/reset/:email', function(req, res, next) {
	if(!(req.body.reset_token && req.body.password && req.params.email)){ // no token,password, or email provided
		return res.status(412).json({
			msg: 'Route requisites not met.'
		});
	}

	User.findOne({
		reset_token: {$eq: req.body.reset_token}
	})
		.select('_id')
		.exec(function(err, user) {
			if (!user) {
				res.status(500).json({
					msg: 'Couldn\'t search the database for user!'
				});
			} else {
				//Create a random salt
				let salt = crypto.randomBytes(128).toString('base64');
				//Create a unique hash from the provided password and salt
				let hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 512, 'sha512');

				let matchUser = {
					_id: user._id
				};

				let updatedUser = {
					password: hash,
					salt: salt,
					reset_token : ''
				};

				let updateCmd = { $set: updatedUser };
				User.update(matchUser, updateCmd).exec(function(err, user){
					if(err){
						res.status(500).send('Error reading database!');
					} else if(!user) {
						res.status(500).send('No user with that ID found in database');
					} else {
						next();
						console.log('Proceeding to call confirm_pwd_email function');
					}
				});
			}
		});
}, EmailService.confirm_pwd_email);

module.exports = router;
