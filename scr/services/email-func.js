const nodemailer = require("nodemailer");
const config = require('../../config.js');
const sendEmailConfig = config.sendEmailConfig;

let sendEmail = async (emailAddress, emailCapt, emailText)=>{	
	let transporter = nodemailer.createTransport({
	host: sendEmailConfig.host,
	port: sendEmailConfig.port,
	secure: sendEmailConfig.secure,
	auth: {
		user: sendEmailConfig.auth.user,
		pass: sendEmailConfig.auth.pass 
	}
	});
	// send email
	let emailInfo = await transporter.sendMail({
		from: sendEmailConfig.auth.user, 
		to: emailAddress, 
		subject: emailCapt, 
		//text: text, 
		html: emailText 
	});
	const now = new Date();
	console.log(`Email - sent - ${emailInfo.messageId} - ${emailAddress} - ${emailCapt} - ${emailText} - ${now}`);
	//console.log("Email sent: %s", info.messageId);
 }

module.exports = {
  sendEmail
  };
  