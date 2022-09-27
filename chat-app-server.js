let path = require("path");
let fs = require("fs");
let http = require("http");
let express = require("express");
let socket = require('socket.io');
let mongodb = require("mongodb");
let mongoose = require("mongoose");
let processenv = require("dotenv").config();
let ejs = require("ejs");
let bcrypt = require('bcrypt');
let cookieParser = require("cookie-parser");
let cookieSession = require("cookie-session");
let bodyParser = require("body-parser"); 
const { json } = require("body-parser");
const authRoutes = require("./routes/oauth-routes");
const passport = require("passport");
const passportSetup = require("./passport/passport-setup");
const { userSchema, oAuthUserSchema, UserModel } = require("./models/user-models");
const { handleValidationError, addUserToConnectedUsersArray, createActiveUserList, removeDisconnectedUser, getSocketIdOfAnUser, findUserUsingASocketId } = require('./utilities/utils');

let expressServer = express();
let server = http.createServer(expressServer);
let port = process.env.PORT || 3000;


let general = [];
let connectedUsersArray = [];
let userImagesObject = {};

expressServer.use(bodyParser.urlencoded({extended: false}));
expressServer.use(json());
expressServer.set('view engine', 'ejs');
expressServer.use(express.static('public'));
expressServer.use(cookieParser());
expressServer.use(cookieSession({
  secret: process.env.COOKIE_SECRET,
  httpOnly: true
}));
expressServer.use(passport.initialize());
expressServer.use(passport.session());

//imported different routes from express router(authRoutes) to handle requests
expressServer.use('/auth', authRoutes); 

// connect to mongodb atlas using mongoose
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(success => {
  server.listen(port, () => {
    console.log("Express server connected to mongodb atlas and listening on port 3000 for request.")
  });
})  
.catch(err => {
  console.log("Couldn't connect to mongodb atlas.");
});


//express server routes
expressServer.get("/homepage", (req, res) => {
  let registeredUser = req.user;
  
  if(registeredUser) {
    if(!registeredUser.userImage) {
      registeredUser.userImage = "";
    }
   res.render('chat-app-home', { username: registeredUser.username, userImage: registeredUser.userImage }); 
  } else {
    res.status(301).redirect('/form');
  }
});

expressServer.get('/', (req, res) => {
  res.sendFile('./chat-app-form.html', { root: __dirname });
});

expressServer.get("/form", (req, res) => {
  res.redirect(301, '/');
});

expressServer.post("/form", async function(req, res) {
  let newUser = new UserModel(req.body);

  newUser.save()
  .then(success => {
    res.json(success);
  })
  .catch(err => {
       let errorObj = handleValidationError(req.body, err);
       res.status(401).json(errorObj);
    });
});

expressServer.post("/login", async function(req, res) {
  try {
    let requestPayload = await UserModel.findUser(req.body); //model of the user schema using a static method
    let mongoUserId = requestPayload.registeredId;
  
    //creating a cookie using "cookie-session" module to log the user in 
    req.session.passport = {user: {_id: mongoUserId}};

    res.json({userStatus: "Successfully logged in."});
 
  } catch(err) {
      res.status(401).json(err);
  }
});

expressServer.get('/logout', (req, res) => {
  req.logout();
  req.session = null;
  res.redirect('/form');
});


//creating a socket for the express server
let io = socket(server);

io.on('connection', function(socket) {

  socket.on('disconnect', function(reason) {
    let disconnectedUser = findUserUsingASocketId(socket.id, connectedUsersArray);
    let updatedList = removeDisconnectedUser(socket.id, connectedUsersArray);
    let userListToSend;
    
    connectedUsersArray = updatedList;
    userListToSend = createActiveUserList(connectedUsersArray);

    general.push(`<p class="chat"><span class="new-user">${disconnectedUser}</span> has left<br>the chat room</p>`);

    io.emit('on user-disconnection', { activeUsersList: userListToSend, generalRoom: general });
  });
 
  socket.on("new user", function(data) {
    addUserToConnectedUsersArray(socket, data, connectedUsersArray);
  
    let userListToSend = createActiveUserList(connectedUsersArray);
    general.push(`<p class="chat"><span class="new-user">${data.user}</span> has joined<br>the chat room.</p>`);

    io.emit("new user", { arrayOfConnectedUsers: userListToSend, generalRoom: general });
    
  });

  socket.on("user image", function(data) {
       let objectKey = Object.keys(data);
        userImagesObject[objectKey[0]] = data[objectKey[0]];
        io.emit('user image', {userImagesObject});
  });

  socket.on("general", function({ user, userText }) {
    general.push(`<p class="chat"><span class="new-user">${user}: </span>${userText}</p>`);
    io.emit('general', {general});
  })

  socket.on('private chat', function({sender, senderText, to}) {
    let socketId = getSocketIdOfAnUser(to, connectedUsersArray);

     socket.to(socketId).emit('private chat', {sender, senderText});
  });
});

