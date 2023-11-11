const jwt = require("jsonwebtoken");
const { tokenExpired } = require("../utils/checkTokenExpire");
const csv = require("csv-parser");
require("dotenv").config();
const fs = require("fs");
const verifyToken = async (req, res, next) => {
  const tokenexpiration = await tokenExpired(
    req.cookies.token,
    req.cookies.refreshtoken
  );
  if (tokenexpiration.token && tokenexpiration.refreshtoken) {
   return next({ statusCode: 400, message: "please login again" });
  }

  const decode = jwt.decode(req.cookies.refreshtoken, process.env.mysecretKey);
  req.body.username = decode.username;
  const username = decode.username;
  const readstream = fs.createReadStream(`./tokenrevoke/${username}tokens.csv`);
  let found = false;
  readstream
    .pipe(csv())
    .on("data", (row) => {
      
      if (
        row.Token == req.cookies.token ||
        row.RefreshToken == req.cookiesrefreshToken
      ) {
        found = true;
      }
    })
    .on("end", () => {
      
      if (found) {
        return res.status(400).send("already signed out");
      }
    })
    .on("error", (err) => {next({statusCode:400,message:"error occured while reading"})});

  if (tokenexpiration.token && !tokenexpiration.refreshtoken) {
    const payload = {
      username: username,
      exp: Math.floor(Date.now() / 1000) + 60 * 8,
    };
    const token = jwt.sign(payload, process.env.secretKey);
    req.cookies.token = token;
    next();
  } else {
    const payload = {
      username: username,
      exp: Math.floor(Date.now() / 1000) + 60 * 8,
    };
    const refreshtoken = jwt.sign(payload, process.env.mysecretKey);
    req.cookies.refreshtoken = refreshtoken;
    next();
  }
};
module.exports = { verifyToken };
