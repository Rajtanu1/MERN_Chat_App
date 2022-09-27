let mongoose = require("mongoose");
let bcrypt = require("bcrypt");
let {Schema, Model} = mongoose;
let path = require("path");

let userSchema = new Schema({
  username: {
    type: String,
    required: [true, "enter an username"],
    unique: true
   },
  email: {
    type: String,
    required: [true, "enter an email"],
    unique: true
   },
  password: {
    type: String,
    required: [true, "enter a password"],
    minlength: [6, "minimum length of six characters"]
   }
  });

//schema for google users
let oAuthUserSchema = new Schema({
  username: String,
  providerID: String,
  userImage: String
});

//hashing/encrypting user password to save in the database in a mongoose hook
userSchema.pre('save', async function(next) {
  let salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//defining static method on the userSchema to be used by its model
userSchema.statics.findUser = async function(userData) {
  let loginData = userData;
  try {
  let auth = await UserModel.findOne({email: loginData.email});
    if(auth) { 
     let passwordVerification = await bcrypt.compare(loginData.password, auth.password);
       if(passwordVerification) {
         loginData.email = "";
         loginData.password = "";
         loginData.registeredId = auth._id;
         loginData.status = 200;
         return loginData;
       } else {
         loginData.email = "";
         loginData.password = "incorrect password";
         loginData.status = 401;
         throw loginData;
       }
     }
     throw loginData;
  } catch(err) {
      if(err.password === "incorrect password") {
        throw loginData;
      } 
      loginData.email = "incorrect email.";
      loginData.password = "";
      loginData.status = 401;
      throw loginData;
  }
};

//Models for the Schemas
let UserModel = mongoose.model("User", userSchema);
let OAuthUserModel = mongoose.model("O-Auth-User", oAuthUserSchema);


module.exports = {userSchema, oAuthUserSchema, OAuthUserModel, UserModel};
