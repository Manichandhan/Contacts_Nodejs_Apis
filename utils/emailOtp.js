
const nodemailer = require("nodemailer");
async function sendEmail(mailOptions,callback) {
  // Create a transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "manichandhankumar@gmail.com",
      pass: process.env.passkey,
    },
  });
 
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if(error){
      callback(error)
    }else{
      callback(error,info.response)
    }
  });
 
}
exports.sendEmail = sendEmail;
