const{sendEmail}=require('../utils/emailOtp')
const otplib=require('otplib')
const readline=require('readline')
const secret=process.env.secret
const deleteContactsOtp=async(req,res,next)=>{
    const otpauth=otplib.authenticator
    const totp = otpauth.generate(secret);

    // Email data
    const mailOptions = {
      from: "manichandhankumar@gmail.com",
      to: req.body.email,
      subject: "otp verification",
      text: `here is your otp.${totp}`,
    }
    async function handleError(err,response){
        if(err){
            next({statusCode:500,message:`${err} error occured while sending email`})
        }else{
            console.log(response);
            
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
                  const currentTimestamp = Math.floor(Date.now() / 1000);
                  const isValid = otpauth.check(userInput, secret, currentTimestamp ||userInput, secret, currentTimestamp - 60);
      
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
 sendEmail(mailOptions,handleError)
  
}
module.exports={deleteContactsOtp}