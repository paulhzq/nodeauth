var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
    'title': 'Register'
  });
});


router.get('/login', function(req, res, next) {
  res.render('login',{
    'title': 'Login'
  });
});

router.post('/register', multipartMiddleware, function(req, res, next) {
  //Get Form Values
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  console.log(name,email,username,password,password2);
  // Check for Image Field

  if(req.files && req.files.profileimage ){
    console.log('Uploading File...');
    //File info
    var profileImageOriginalName  = req.files.profileimage.originalname;
    var profileImageName          = req.files.profileimage.name;
    var profileImageMime          = req.files.profileimage.mimetype;
    var profileImagePath          = req.files.profileimage.path;
    var profileImageExt          = req.files.profileimage.extension;
    var profileImageSize          = req.files.profileimage.size;
  } else {
    var profileImageName = 'noimage.png';
  }

  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Name field is required').isEmail();
  req.checkBody('email','Name field is required').notEmpty();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    })
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileImageName
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success','You are now registered and may log in');
    res.location('/');
    res.redirect('/');
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
    function(username, password, done){
      User.getUserByUsername(username, function(err, user){
        if(err) throw err;
        if(!user){
          console.log('Unknown User');
          return done(null,false,{message: 'Unknown User'});
        }

        User.comparePassword(password, user.password, function(err, isMatch){
          if(err) throw err;
          if(isMatch){
            return done(null,user);
          } else {
            console.log('Invalid password');
            return done(null,false,{message:'Invalid Password'});
          }
        });
      });
    }
));

// router.post('/login', passport.authenticate('local',{ successRedirect:'/', failureRedirect:'/users/login', failureFlash:'Invalid username or password'}), function(req,res){
router.post('/login', passport.authenticate('local', {successRedirect:'/' ,failureRedirect:'/users/login', failureFlash:'Invalid username or password'}), function(req, res){
  console.log('Authentication Successful');
  req.flash('success', 'You are logged in');
  res.redirect('/');
});

router.get('/logout',function(req, res){
  req.logout;
  req.flash('success','You have logged out');
  res.redirect('/users/login');
});


module.exports = router;
