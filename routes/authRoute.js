const express = require("express");
const router = express.Router();
const { register, signin, signout } = require("../Controller/authControl");
const{generateOtp}=require('../Middlewares/generateOtp')
router.post("/register",generateOtp,register);

router.post("/signin",signin);

router.delete("/signout",signout)
module.exports = router;
