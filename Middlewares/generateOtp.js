const Joi = require("@hapi/joi");
const otplib=require('otplib')
const readline = require("readline"); 
require('dotenv').config()
const secret=process.env.secret
const { sendEmail } = require("../utils/emailOtp");
async function generateOtp(req, res, next) {
  const userValidation = Joi.object({
    email: Joi.string()
      .email({ multiple: false, minDomainSegments: 2 })
      .required()
      .messages({
        "string.email": "enter a valid email",
        "string.base": "please enter email",
        "string.empty": "email field can't be left empty",
        "any.required": "Enter your email",
      }),
    username: Joi.string().alphanum().min(6).max(14).required().messages({
      "string.base":
        "enter username which contains only alphabets and numeric values",
      "string.empty": "username can't be empty",
      "string.alphanum": "enter alphanum values for username",
      "any.required": "please enter username",
      "string.min": "username should be min of length 6",
      "string.max": "username can't exceed length 14",
    }),
    password: Joi.string()
      .min(8)
      .required()
      .regex(/^[A-Z][a-z]+\S\d+$/)
      .messages({
        "string.min": "password length must contain min 8 ",
        "any.required": "please enter valid password ",
        "string.pattern.base":
          "The field must start with an uppercase letter, followed by lowercase letters, and end with a non-whitespace character followed by digits.",
        "string.empty": "please enter password can't be empty",
      }),
  });
  const validUser = userValidation.validate(
    {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    },
    { abortEarly: false }
  );
  if (validUser.error) {
    next({
      statusCode: 400,
      messages: validUser.error.details.map((detail) => detail.message),
    });
  } else {
    const otpauth=otplib.authenticator
    const totp = otpauth.generate(secret);
    console.log(totp,secret);
    // Email data
    const mailOptions = {
      from: "manichandhankumar@gmail.com",
      to: req.body.email,
      subject: "otp verification",
      text: `here is your otp.${totp}`,
    };
    function handleResult(error, result) {
      if (error) {
        console.log(error.message);
        next(new Error(`error while sending otp ${error.message}`));
      } else {
        

        res.set("EmailOtpSent", result);
        const rl = readline.createInterface({
          input: process.stdin, // Read from standard input (console)
          output: process.stdout, // Write to standard output (console)
        });

        rl.question("Enter otp:", (userInput) => {
          if (userInput == "") {
            const otp=otpauth.generate(secret)
            mailOptions.text=`your otp is here.${otp}`
            sendEmail(mailOptions,handleResult);
          } else {
            const isValid = otpauth.check(userInput,secret);

            if (isValid) {
              console.log("OTP is valid.");
              next();
            } else {
              next({
                statusCode: 400,
                message: "OTP is invalid",
                isvalid: isValid,
              });
            }
          }
          rl.close();
        });
      }
    }
    
    sendEmail(mailOptions,handleResult);
  }
}
exports.generateOtp = generateOtp;
