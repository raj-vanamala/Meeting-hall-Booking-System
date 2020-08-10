var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const MongoDb = require('mongodb');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();


router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signUp',async function(req,res){

    try {

      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(req.body.password,salt)
      req.body.password = hash

      let url = process.env.DB1;
      let client = await MongoDb.connect(url);
      let db = await client.db("users");
      let data = await db.collection("userList2").insertOne({

        "email" : req.body.email,
        "firstName" : req.body.firstName,
        "password" : req.body.password,
        "mobile" : req.body.mobile
      })

      let jwtToken = await jwt.sign({email : req.body.email,firstName : req.body.firstName},process.env.JWT,{expiresIn : "1h"}) 
      await client.close();

      res.json({
        "token" : jwtToken,
        "message" : "Registration Successful",
        "status" : "success"
      })
    
    } catch (error) {
      console.log(error);
    }
})

router.post('/signIn',async function(req,res){


  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("users");

      let user = await db.collection("userList2").findOne({email : req.body.email})
      console.log(user)
      let result = await bcrypt.compare(req.body.password,user.password)
      if(result === true) {
        
        let jwtToken = await jwt.sign({email : req.body.email,firstName : user.firstName},process.env.JWT,{expiresIn : "1h"})

        res.json({
          "token" : jwtToken,
          "message" : "Authentication Successful",
          "status" : "Successful",
          "name" : user.firstName
        })

      } else {

        res.json({
          message : "Password does not match",
          "status" : "Not Successful"
        })

      }
    await client.close();

  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
