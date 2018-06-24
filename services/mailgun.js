var config = require('config');
var api_key = config.get('mailgun_api_key');
var domain = config.get('mailgun_domain');
var reset_uri = config.get('reset_uri');
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var activate_email = config.get('activate_email');

module.exports.forgot_email = function(req, res) {
  var data = JSON.parse(JSON.stringify(config.get('forgot_email_data')));
  data.to = req.body.email;
  data.text = data.text + "\nThis is your reset token " + req.body.rtoken +
  '\nVisit ' + reset_uri + req.body.email + ' to reset your password.';
  if(activate_email === "true"){ // for unit tests or for some other reason would like to deactive emails
    mailgun.messages().send(data).then(function(body){
      // console.log(body); debugging purposes only
      console.log('A forgot email was sent.');
      res.status(200).send({msg: 'success. Email has been sent to your address'});
    }).catch(function(err){
      console.log(err); // administrator should look at the console
      res.status(500).send({msg: 'failed. An error occured with the email service sending the email.'});
    });
  } else {
    res.status(200).send({msg: 'success. Email has been sent to your address'});
  }
}

module.exports.confirm_pwd_email = function(req, res) {
  var data = JSON.parse(JSON.stringify(config.get('confirm_pwd_email_data')));
  data.to = req.params.email;
  if(activate_email === "true"){ // for unit tests or for some other reason would like to deactive emails
    mailgun.messages().send(data).then(function(body){
      // console.log(body); debugging purposes only
      console.log('A confirmation for password reset has been sent');
      res.status(200).send({msg: 'success. Password has been changed'});
    }).catch(function(err){
      console.log(err);
      res.status(500).send({msg: 'failed. An error occured with the email service sending the email.'});
    });
  } else {
    res.status(200).send({msg: 'success. Password has been changed'});
  }
}

module.exports.welcome_email = function(req, res) {
  var data = JSON.parse(JSON.stringify(config.get('welcome_email_data')));
  data.to = req.body.email;
  if(activate_email === "true"){ // for unit tests or for some other reason would like to deactive emails
    mailgun.messages().send(data).then(function(body){
      // console.log(body); debugging purposes only
      // console.log(res); debugging purposes only
      console.log('Welcome email has been sent.');
    }).catch(function(err){
      console.log(err);
      res.status(500).send({msg: 'failed. An error occured with the email service sending the email.'});
    });
  }
}
