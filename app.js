var express = require("express");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var crypto = require("crypto");
var hash = crypto.createHash('sha256');
var passport = require("passport");
var LocalStrategy = require("passport-local");
//mongoose.connect("mongodb://localhost/health_db");
mongoose.connect("mongodb+srv://pranit:softengg@cluster0-ya4na.mongodb.net/test?retryWrites=true&w=majority");
var app = express();
var bodyParser = require("body-parser");
var HealthParameter = require("./models/healthparameter");
var User = require("./models/users");
var sjcl = require("./static/sjcl");

app.use(function(req,res,next){
    res.locals.count = req.count;
    next();
});

app.use(require("express-session")({
  secret: "Software engineering 1",
  resave:false,
  saveUninitialized:false
}));

app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.user = req.user;
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.get("/", function(req,res){
    res.render("landing");
});

app.get("/comparison",isLoggedIn,function(req,res){
      HealthParameter.find(function(err,data){
          if(err){
            console.log(err);
          }else{
            HealthParameter.find({username : req.user.username},function(err,allData){
                res.render("comparison",{data:data,allData:allData});
            });
          }
      });
});

app.get("/mydata",isLoggedIn,function(req,res){
    HealthParameter.find({username : req.user.username},function(err,myData){
        if(err){
          console.log(err);
        }else{
            res.render("mydata",{myData:myData,currentUser: req.user});
        }
    });
});

app.get("/myhistory",isLoggedIn,function(req,res){
    HealthParameter.find({username : req.user.username},function(err,data){
        if(err){
          console.log(err);
        }else{
          res.render("myhistory",{data:data});
        }
    });
});

app.post("/mydata",isLoggedIn,function(req,res){
    var weight = req.body.weight;
    var height = req.body.height;
    var spatterns = req.body.spatterns;
    var cholesterol = req.body.cholesterol;
    var bsugar = req.body.bsugar;
    var bps = req.body.bps;
    var bpd = req.body.bpd;
    var prevHash;
    var date = new Date();
    var bmi;
    var timestamp = Date.now();
    var dateAndTime = date.toLocaleString();

    HealthParameter.find({username:req.user.username},function(err,data){
      if(data.length == 0){
        prevHash = "0";
      }else{
        prevHash = data[data.length - 1].currentHash;
      }

      let newData = {
                      username: req.user.username,
                      weight: weight,
                      height: height,
                      bmi: weight/((height/100)*(height/100)),
                      sleepPatterns: spatterns,
                      cholesterol: cholesterol,
                      bloodSugar: bsugar,
                      bloodPressure_systolic: bps,
                      bloodPressure_diastolic: bpd,
                      timeStamp: timestamp,
                      prevHash: prevHash.toString(),
                      currentHash: sjcl.hash.sha256.hash(
                req.user.username + weight + height + bmi + spatterns + cholesterol + bsugar + bps + bpd + timestamp + dateAndTime + prevHash
            ).toString(),
                      dateAndTime:dateAndTime }
      HealthParameter.create(newData,function(err, newCreated){
          if(err){
            console.log(err);
          }else{
            res.redirect("/mydata");
            console.log("Created user with health paramters");
          }
      });
    });
});

app.get("/mydata/new",isLoggedIn,function(req,res){
    res.render("new.ejs");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password,function(err,user){
     if(err){
       console.log(err);
       return res.render("register")
     }
     passport.authenticate("local")(req,res,function(){
       tstamp = 0;
       noOfBlocks = 0;
       var newUserData = {
         username : req.body.username,
         timestamp : tstamp,
         no_of_blocks : noOfBlocks
       }
       UserData.create(newUserData,function(err,newDataCreated){
           if(err){
             console.log(err);
           }else{
             console.log(newDataCreated);
           }
       });
       res.redirect("/mydata");
     });
  });
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",passport.authenticate("local",
    {successRedirect: "/mydata",
     failureRedirect: "/login"
   }),function(req,res){
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/login");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    req.flash("error","You need to be logged in to do that");
    res.render("login");
}

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("HealthColate+ server has started.");
});
