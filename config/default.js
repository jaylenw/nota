module.exports = {
reset_email_data: {
    from: process.env.FROM_HEADER || 'Excited User <me@samples.mailgun.org>',
    to: "place-holder@email.com",
    subject: 'Hello',
    text: 'Testing some Mailgun awesomeness!'
  },
  activate_email: process.env.ACTIVATE_EMAIL || false,
  mailgun_api_key: process.env.MAILGUN_API_KEY || "place-holder-apiKey",
  mailgun_domain: process.env.MAILGUN_DOMAIN || "place-holder-domain"
}
