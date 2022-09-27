
function handleValidationError(requestPayload, errorObject) {
  let errorObj = {};

  for (let props in requestPayload) {
    errorObj[props] = "";
  }

  if (errorObject.code) {
    let [key] = Object.keys(errorObject.keyPattern);
    errorObj[key] = `This ${key} has already been taken`;
  } else {
    let errors = errorObject.errors;
    for (let path in errors) {
      errorObj[path] = errors[path].properties.message;
    }
  }
  return errorObj;
}

function addUserToConnectedUsersArray(socket, socketData, arr) {
  socketData.socketID = socket.id;
  arr.push(socketData);
};

function createActiveUserList(arr) {
  let usernames = []

  for (let name of arr) {
    usernames.push(name.user);
  };

  return usernames;
};

function removeDisconnectedUser(socketId, userList) {
  let updatedList = userList.filter(user => { return user.socketID !== socketId });
  return updatedList;
}

function getSocketIdOfAnUser(username, activeUsersArray) {
  let socketId;

  for (let user of activeUsersArray) {
    if (user.user === username) {
      socketId = user.socketID;
      return socketId;  
    }
  }
}

function findUserUsingASocketId(socketId, activeUsersArray) {
  let username;

  for (let user of activeUsersArray) {
    if (user.socketID === socketId) {
      username = user.user;
      return username;
    }
  }
}

module.exports = { handleValidationError, addUserToConnectedUsersArray, createActiveUserList, removeDisconnectedUser, getSocketIdOfAnUser, findUserUsingASocketId };