var express = require('express');
var mongoose = require('mongoose');
var Task = mongoose.model('Task');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/tasks', function(req, res, next) {
  // return res.status(500).json("asdfasdfasdfasfd");
  Task.find().exec(function(err, tasks){
    if(err){
      res.status(500).send("Error reading database!");
    } else {
      res.status(200).json(tasks);
    }
  });
});

router.post('/tasks', function(req, res){
  if(!(req.body.title && req.body.body)){
    return res.status(412).send("Precondition failed. Required: title, body.")
  }

  var myTask = new Task({
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

router.put('/tasks/:id', function(req, res){
  var updatedTask = {}
  if(req.body.title) updatedTask.title = req.body.title;
  if(req.body.body) updatedTask.body = req.body.body;
  if(req.body.archive) updatedTask.archive = req.body.archive;

  var updateCmd = { $set: updatedTask }

  Task.update(req.params.id, updateCmd).exec(function(err, task){
    if(err){
      res.status(500).send("Error reading database!");
    } else if(!task) {
      res.status(404).send("No task with that ID found.");
    } else {
      res.status(200).send(task);
    }
  });
});

module.exports = router;
