const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const csv = require("csv-parser");

const {tokenExpired}=require('../utils/checkTokenExpire')
const {revokeTokens}=require('../utils/revoketoken')
const register = async (req, res, next) => {
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(req.body.password, salt);
  const data = [
    {
      username: req.body.username,
      email: req.body.email,
      password: hashedpassword,
    },
  ];

  const csvWriter = createCsvWriter({
    path: "./usersdata/users.csv", // The name of the output CSV file
    header: [
      { id: "username", title: "Username" },
      { id: "email", title: "Email" },
      { id: "password", title: "Password" },
    ],
    append: true,
  });
  const userExist = async (email, username) => {
    if(!fs.existsSync("./usersdata/users.csv")){
      csvWriter.writeRecords([{username:'Username',email:'Email',password:'Password'}])
       }
    return new Promise((resolve, reject) => {
     
      const readStream = fs.createReadStream("./usersdata/users.csv"); // Adjust the file path as needed

      readStream
        .pipe(csv())
        .on("data", (row) => {
          // Check if the username and email exist in the current row
          if (row.Username === username && row.Email === email) {
            readStream.destroy(); // Stop reading the file once a match is found
            resolve({
              result: true,
              message: `${username} and ${email} already exist`,
            }); // User exists
          } else if (row.Email === email) {
            readStream.destroy();
            resolve({ result: true, message: `${email} already exist` });
          } else if (row.Username === username) {
            readStream.destroy();
            resolve({ result: true, message: `${username} already exist` });
          }
        })
        .on("end", () => {
          resolve(false); // User does not exist
        })
        .on("error", (error) => {
          reject(error); // Handle errors
        });
    });
  };
  userExist(data[0].email, data[0].username)
    .then((exist) => {
      if (exist === false) {
        
        csvWriter
          .writeRecords(data)
          .then(() => {
            console.log("written successfully");
          })
          .catch((err) => {
            next({
              statusCode: 400,
              error: err,
              message: "something went wrong while writing",
            });
          });

        const token = jwt.sign(
          {
            username: req.body.username,
            exp: Math.floor(Date.now() / 1000) + 60 * 5,
          },
          process.env.secretKey
        );
        const refreshtoken = jwt.sign(
          {
            username: req.body.username,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
          },
          process.env.mysecretKey
        );
        res.cookie("refreshtoken", refreshtoken, {
          maxAge: Math.floor(Date.now() / 1000) + 60 * 60 * 25,
        });
        res.cookie("token", token, {
          maxAge: Math.floor(Date.now() / 1000) + 60 * 8,
        });
        res.status(201).send({
          message: "user created successfully",
          username: req.body.username,
          email: req.body.email,
        });
      } else {
        next({ statusCode: 400, err: exist });
      }
    })
    .catch((err) => {
      next({
        statusCode: 500,
        message: err,
      });
    });
}; 

const signin = async (req, res, next) => {
  const tokenresults=await tokenExpired(req.cookies.token,req.cookies.refreshtoken)
  console.log(tokenresults);
  if(!tokenresults.token || !tokenresults.refreshtoken){
    return res.status(400).send("user already logged In")
  }
  const prom = new Promise((resolve, reject) => {
    const readstream = fs.createReadStream("./usersdata/users.csv");
    readstream
      .pipe(csv())
      .on("data", (row) => {
        if (
          row.Username === req.body.username ||
          row.Email === req.body.email
        ) {
          resolve(row);
        }
      })
      .on("end", () => {
        resolve(false);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
  prom
    .then(async (exist) => {
      if (exist) {
        const matchPassword = await bcrypt.compare(
          req.body.password,
          exist.Password
        );
        if (matchPassword) {
          const token = jwt.sign(
            {
              username: req.body.username,
              exp: Math.floor(Date.now() / 1000) + 60 * 5,
            },
            process.env.secretKey
          );
          const refreshtoken = jwt.sign(
            {
              username: req.body.username,
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            },
            process.env.mysecretKey
          );
          res.cookie("refreshtoken", refreshtoken, {
            maxAge: Math.floor(Date.now() / 1000) + 60 * 60 * 25,
          });
          res.cookie("token", token, {
            maxAge: Math.floor(Date.now() / 1000) + 60 * 8,
          });
          res.status(200).send("user logged in successfully");
        } else {
          next({ statusCode: 404, message: "incorrect password" });
        }
      } else {
        res
          .status(400)
          .send(`${req.body.username || req.body.email}  doesn't exist`);
      }
    })
    .catch((err) => {
      next(err);
    });
};

const signout = async (req, res, next) => {
  const tokenresults=await tokenExpired(req.cookies.token,req.cookies.refreshtoken)
  
  if(!tokenresults.token || !tokenresults.refreshtoken){
    
   const result= await revokeTokens(res,req.cookies.token,req.cookies.refreshtoken,next)
   if(result){
    res.status(200).send(result)
   }
   
  }else{
    next({statusCode:400,message:'user already logged out'})
  }
  
};

module.exports = { register, signin, signout };
