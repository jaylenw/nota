const express = require('express');
const mongoose = require('mongoose');
const Task = mongoose.model('Task');
const User = mongoose.model('User');
const SessionService = require('../services/sessions.js');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express' });
});

router.get('/tasks', function(req, res) {
	if(!(req.query.token)){
		return res.status(412).json({
			msg: 'Route requisites not met.'
		});
	}

	validateUser(req, res, function(user){
		Task.find({
			accountId: user._id
		}).exec(function(err, tasks){
			if(err){
				res.status(500).send('Error reading database!');
			} else {
				res.status(200).json(tasks);
			}
		});
	});
});

router.post('/tasks', function(req, res){
	if(!(req.body.title && req.body.body && req.body.token)){
		return res.status(412).send('Precondition failed. Required: title, body.');
	}

	validateUser(req, res, function(user){
		Task({
			accountId: user._id,
			title: req.body.title,
			body: req.body.body,
			archived: false,
			date: Date.now()
		}).save(function(err, task){
			if(err){
				res.status(500).send('Error writing database!');
			} else {
				res.status(201).json(task);
			}
		});
	});
});

router.put('/tasks/:id', function(req, res){
	if(!(req.body.token)){
		return res.status(412).json({
			msg: 'Route requisites not met.'
		});
	}

	validateUser(req, res, function(user){
		let matchTask = {
			_id: req.params.id,
			accountId: user._id
		};

		let updatedTask = {};
		if(req.body.title) updatedTask.title = req.body.title;
		if(req.body.body) updatedTask.body = req.body.body;
		if(typeof req.body.archive == 'boolean') updatedTask.archive = req.body.archive;

		let updateCmd = { $set: updatedTask };

		Task.updateOne(matchTask, updateCmd).exec(function(err, successResult){
			if(err){
				res.status(500).send('Error reading database!');
			} else if(!successResult) {
				res.status(404).send('No task with that ID found in your account.');
			} else {
				res.status(204).send('Task updated successfully.');
			}
		});
	});
});

router.delete('/tasks/:id', function(req, res){
	if(!(req.query.token)){
		return res.status(412).send('Precondition failed. Required: token.');
	}

	validateUser(req, res, function(user){
		let specificTask = {
			_id: req.params.id,
			accountId: user._id
		};

		Task.findById(specificTask).exec(function(err, specificTask){
			if(err){
				res.status(500).send('Error reading database!');
			}
			else if(!specificTask){
				res.status(404).send('No task with that ID found in your account.');
			}
			else {
				if(specificTask) specificTask.remove();
				res.status(200).json('ok');
			}
		});
	});
});


function validateUser(req, res, success){
	let token = req.query.token || req.body.token;
	SessionService.validateSession(token, 'user', function(accountId) {
		User.findById(accountId)
			.select('name email')
			.exec(function(err, user) {
				if (err) {
					res.status(500).json({
						msg: 'Couldn\'t search the database for user!'
					});
				} else if (!user) {
					res.status(401).json({
						msg: 'User not found, user table out of sync with session table!'
					});
				} else {
					success(user);
				}
			});
	}, function(err){
		res.status(err.status).json(err);
	});
}

module.exports = router;
