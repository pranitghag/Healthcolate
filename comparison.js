const express = require("express");
const mongoose = require("mongoose");

const passport = require("passport");
const LocalStrategy = require("passport-local");
mongoose.connect("mongodb://localhost/health_db");
const app = express();
const bodyParser = require("body-parser");
const HealthParameter = require("./models/healthparameter");
const User = require("./models/users");
const UserData = require("./models/userData")

app.use(function(req,res,next){
    res.locals.user = req.user;
    next();
});

HealthParameter.find({username : "pranit.ghag"},function(err,data){
    if(err){
      console.log(err);
    }else{
      exports.value = data;
    }
});
