const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const mongoose = require("mongoose");
const {OAuthUserModel, UserModel} = require("../models/user-models");
require("dotenv").config({path: "../.env"});

const googleAuth = JSON.parse(process.env.GOOGLE_OAUTH_KEYS); //credentials to use Google OAuth API

//serializing to create cookie for google users and deserializing to authenticate cookie of google users
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  let user = UserModel.findById(id, (err, succ) => {
    if(succ) {
      done(err, succ);
    } else {
      let oauthUser = OAuthUserModel.findById(id, (err, succ) => {
        if(succ) {
          done(null, succ);
        } 
      });
    }
  });
});

//strategy configuration
passport.use(new GoogleStrategy({
  clientID: googleAuth.id,
  clientSecret: googleAuth.secret,
  callbackURL: "http://localhost:3000/auth/callbackURL"
}, (accessToken, refreshToken, profile, done) => {//callback function of the google strategy
  OAuthUserModel.findOne({providerID: profile.id}, function(err, succ) {
    if(succ) {
      done(null, succ);
    } else {
      let newAuthUser = new OAuthUserModel({
        username: profile.displayName,
        providerID: profile.id,
        userImage: profile._json.picture
      });
  
      
      newAuthUser.save()
      .then(succ => {
        done(null, succ);
      })
      .catch(err => {
        console.log(err);
      });
    }
  }); 
}));
