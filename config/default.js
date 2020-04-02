module.exports = {
	forgot_email_data: {
		from: process.env.FROM_HEADER || 'Nota TEST <me@samples.mailgun.org>',
		to: 'place-holder@email.com',
		subject: 'Nota Account Activity - Reset Password',
		text: 'Success! A reset token has been generated for you. Do not reply back to this email.'
	},
	confirm_pwd_email_data: {
		from: process.env.FROM_HEADER || 'Nota TEST <me@samples.mailgun.org>',
		to: 'place-holder@email.com',
		subject: 'Nota Account Activity - Password Reset Success',
		text: 'Success! Nota Account Password has been changed. Do not reply back to this email.'
	},
	welcome_email_data: {
		from: process.env.FROM_HEADER || 'Nota TEST <me@samples.mailgun.org>',
		to: 'place-holder@email.com',
		subject: 'Nota Account Activity - Welcome!',
		text: 'Success! Your Nota account is registered! Do not reply back to this email.'
	},
	activate_email: process.env.ACTIVATE_EMAIL || 'false',
	mailgun_api_key: process.env.MAILGUN_API_KEY || 'place-holder-apiKey',
	mailgun_domain: process.env.MAILGUN_DOMAIN || 'place-holder-domain',
	reset_uri: process.env.RESET_URI || 'https://placeholder.com',
	test_email: process.env.TEST_EMAIL || 'user1@test.com'
};
