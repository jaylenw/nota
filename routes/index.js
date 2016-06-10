var express = require('express');
var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var SessionService = require('../services/sessions.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/tasks', function(req, res, next) {
  if(!(req.body.token)){
      return res.status(412).json({
          msg: "Route requisites not met."
      });
  }

  validateUser(req, res, function(user){
    Task.find({
      accountId: user._id
    }).exec(function(err, tasks){
      if(err){
        res.status(500).send("Error reading database!");
      } else {
        res.status(200).json(tasks);
      }
    });
  });
});

router.post('/tasks', function(req, res){
  if(!(req.body.title && req.body.body && req.body.token)){
    return res.status(412).send("Precondition failed. Required: title, body.")
  }

  validateUser(req, res, function(user){
    var myTask = new Task({
      accountId: user._id,
      title: req.body.title,
      body: req.body.body,
      archived: false,
      date: Date.now()
    }).save(function(err, task){
      if(err){
        res.status(500).send("Error writing database!");
      } else {
        res.status(201).json(task);
      }
    });
  });
});

router.put('/tasks/:id', function(req, res){
  if(!(req.body.token)){
      return res.status(412).json({
          msg: "Route requisites not met."
      });
  }

  validateUser(req, res, function(user){
    var matchTask = {
      _id: req.params.id,
      accountId: user._id
    }

    var updatedTask = {}
    if(req.body.title) updatedTask.title = req.body.title;
    if(req.body.body) updatedTask.body = req.body.body;
    if(req.body.archive) updatedTask.archive = req.body.archive;

    var updateCmd = { $set: updatedTask }

    Task.update(req.params.id, updateCmd).exec(function(err, task){
      if(err){
        res.status(500).send("Error reading database!");
      } else if(!task) {
        res.status(404).send("No task with that ID found in your account.");
      } else {
        res.status(200).send(task);
      }
    });
  });
});

function validateUser(req, res, success){
    var token = req.query.token || req.body.token;
    SessionService.validateSession(token, "user", function(accountId) {
        User.findById(accountId)
        .select('name email')
        .exec(function(err, user) {
            if (err) {
                res.status(500).json({
                    msg: "Couldn't search the database for user!"
                });
            } else if (!user) {
                res.status(401).json({
                    msg: "User not found, user table out of sync with session table!"
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
