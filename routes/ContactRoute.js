const express=require('express')

const router=express.Router()
const{findAllContacts,findOneContact,updateOne,createContact,deleteAllContacts,deleteOneContact}=require("../Controller/contactControl")
const{verifyToken}=require('../Middlewares/verifytoken')
const{deleteContactsOtp}=require('../Middlewares/deletecontactsVerify')
const{contactValid}=require('../Middlewares/contactValidation')
router.get('/findContact/:contact',verifyToken,findOneContact)

router.get("/getAll",verifyToken,findAllContacts)

router.post("/createContact",verifyToken,contactValid,createContact)

router.put("/updateOneContact",verifyToken,updateOne)

router.delete('/deleteContact',verifyToken,deleteOneContact)

router.delete('/deleteAll',verifyToken,deleteContactsOtp,deleteAllContacts)


module.exports=router