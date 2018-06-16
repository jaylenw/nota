var config = require('config');
var api_key = config.get('mailgun_api_key');
var domain = config.get('mailgun_domain');
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var activate_email = config.get('activate_email');

module.exports.reset_email = function(req, response, next) {
  if(activate_email){
    mailgun.messages().send(config.get('reset_email_data')).then(function(body){
      console.log(body);
      response.status(200).send({msg: 'success. Password has been changed'});
    }).catch(function(err){
      console.log(err);
    });
  } else { // for unit tests or for some other reason would like to deactive emails
    response.status(200).send({msg: 'success. Password has been changed'});
  }

}
