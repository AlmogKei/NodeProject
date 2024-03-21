const express = require("express");
const bcrypt = require("bcrypt");
const {auth} = require("../middlewares/auth")
const {UserModel,validateUser,validateLogin,createToken} = require("../models/userModel");

const router = express.Router();


router.get("/userInfo", auth ,async(req,res) => {
  try{
    const user = await UserModel.findOne({_id:req.tokenData._id},{password:0})
    res.json(user);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
  
})

router.get("/list", auth,async(req,res) => {
  try{
    const skip = req.query.skip || 0;
    const data = await UserModel.find({},{password:0}).limit(20).skip(skip);
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.post("/",async(req,res) => {
  const validBody = validateUser(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    const user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    user.password = "****";
    res.status(201).json(user);
  }
  catch(err){
    if(err.code == 11000){
      return res.status(400).json({msg:"Email already in system",code:11000})
    }
    console.log(err);
    res.status(502).json({err})
  }
})

router.post("/login",async(req,res) => {
  const validBody = validateLogin(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    const user = await UserModel.findOne({email:req.body.email})
    if(!user){
      return res.status(401).json({err:"Email not in system"});
    }
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass){
      return res.status(401).json({err:"password not match"});
    }
    const token = createToken(user._id, user.role);
    res.json({token})
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.patch("/role/:id/:role",auth, async(req,res) => {
  try{
    const id = req.params.id;
    const role = req.params.role;
    if(id == req.tokenData._id){
      return res.status(401).json({err:"you cant edit your self"})
    }
    const data = await UserModel.updateOne({_id:id},{role});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

// export default
module.exports = router;