   //create socket connection
   let socket = io.connect(`https://${window.location.host}`);
  
   //query DOM
   let user = document.getElementById('profile-name');
   let profileCard = document.getElementById("profile-card");
   let profileImage = document.getElementById("profile-image");
   let ul = document.getElementById("active-list");
   let userListContainer = document.querySelector("#users-container");
   let activeList = document.getElementById('active-users');
   let logoutOption = document.getElementById('logout');
   let userListForPrivateChat = document.getElementById('users-list');
   let messageNotification = document.querySelector(".message_notification");
   let notifyText = document.querySelector('.notifying-text');
   let chatWindow = document.getElementById("chat-window");
   let conversationContainer = document.getElementById('conversation-box');
   let messageInputField = document.getElementById('enter-message');
   let navButton = document.querySelector(".navigation-button");
   let navbar = document.querySelector(".navbar");
   let sendButton = document.getElementById('send-button');
   let chatEntity = document.getElementById("room-name-header");
   let avatarContainer = document.querySelector(".avatar-container");
   let selectedAvatar = document.querySelector(".selected-avatar_avatar");
   let confirmAvatarButton = document.querySelector(".avatar-confirm-button");
   let observer;
   let observerConfig = {childList: true, attributes: true, subtree: true, attributeFilter: ['src']};
   let generalRoomConversation = [];
   let messages = [];
   let unreadMsgs = {};

   //callback for Mutation Observer constructor
   function observeDOMChanges(mutations) {
     let userImage = {};
     userImage[user.textContent] = profileImage.src;
     socket.emit('user image', userImage);
   }

   observer = new MutationObserver(observeDOMChanges);
   observer.observe(profileCard, observerConfig);

   //registering event listener on the send button
   sendButton.addEventListener('click', function(event) {
     let hasMsgObj = false;
     let chatName = chatEntity.lastElementChild.textContent;
     let message = messageInputField.value;
     messageInputField.value = "";
     messageInputField.focus();
     if(message === '') {
       return;
     }

     if(chatName !== "General") {
       if(messages.length) {
         for (let chat of messages) {
           if(chat.chatOf === chatName) {
             chat.messages.push(`<div class="right"><span class="right-text">${message}</span></div>`);
             hasMsgObj = true;
             conversationContainer.innerHTML = chat.messages.join("");
           }
         }
       }
       if(!hasMsgObj) {
         let conversationOf = {chatOf: chatName};
         conversationOf.messages = [`<div class="right"><span class="right-text">${message}</span></div>`];
         messages.push(conversationOf);
         conversationContainer.innerHTML = conversationOf.messages.join("");
       }
       socket.emit('private chat', {
         sender: user.textContent,
         senderText: message,
         to: chatName
     });
     } else {
       socket.emit('general', {user: user.textContent, userText: message});
     }
     conversationContainer.scrollTop = conversationContainer.scrollHeight + 5;
   });

   //registering event listener on the ul element
   ul.addEventListener('click', function(event) {
     let height = activeList.scrollHeight + "px";
     let animationName= 'collapse';
     let computedStyleHeight = window.getComputedStyle(activeList).height;
      
     //checking if the active users' list has been extended
     if(computedStyleHeight === activeList.scrollHeight + "px") {
       activeList.style.animationName = 'shrink';
     } else { 
       activeList.style.setProperty("--scroll-height", height);
       activeList.style.animationName = animationName;
     }
   });

   logoutOption.addEventListener('click', function(event) {
     window.location.href = `https://${window.location.host}/logout`;
   })

   navButton.addEventListener('click', function(event) {
     let computedStyleObject = getComputedStyle(navButton);
     if(computedStyleObject.animationName === 'scale') {
       navButton.style.animationName = "";
       navButton.style.animationIterationCount = "initial";
       navButton.style.animationDirection = "initial";
     }
     if(event.target.localName === 'i') {
        if(event.target.offsetParent.style.animationName && event.target.offsetParent.style.animationName === "spin-clockwise") {
          event.target.offsetParent.style.animationName = "spin-anti-clockwise";
          navbar.classList.remove("flip-open");
        } else {
          event.target.offsetParent.style.animationName = "spin-clockwise";
          navbar.classList.add("flip-open");
        }
      }
   });

   navbar.addEventListener('click', function(event) {
     let classValue;
     let aNavbarIcon = document.querySelector('.navbar_icon');
     if(event.target.offsetParent === navbar) {
       for(let child of navbar.children) { //removing class from a previously selected navigation icon
         if(child.className.includes('selected')) {
           child.classList.remove('selected');
         }
        }
      } else if (event.target.offsetParent === aNavbarIcon) {
         for(let child of navbar.children) {
           if(child.className.includes("selected")) { //added the same logic as above if the selected element doesn't have navbar element as its direct parent
             child.classList.remove("selected");
           }
         }
      }
      if(event.target.className.includes("navbar_icon")) { //adding class to the newly selected navigation icon
        event.target.classList.add('selected');
        classValue = event.target.firstElementChild.classList[1];
      } else if (event.target.localName === 'i') {
        event.target.parentElement.classList.add('selected');
        classValue = event.target.classList[1]; 
      } 

      if(classValue !== undefined && classValue.includes('circle')) {
        userListContainer.style.animationName = 'slide-left';
        profileCard.style.animationName = "closing-in";
        if(window.innerWidth < 769) {
          if(!chatWindow.className.includes("page-turn")) {
            chatWindow.classList.add('page-turn');
          }
        }
      } else if(classValue !== undefined && classValue.includes('message')) {
        if(chatWindow.className.includes('page-turn')) {
          chatWindow.classList.remove('page-turn');
        }        
      } else if(classValue !== undefined && classValue.includes('group')) {
        if(!chatWindow.className.includes('page-turn') && window.innerWidth < 769) {
          chatWindow.classList.add('page-turn');
        }
        profileCard.style.animationName = "slide-right";
        userListContainer.style.animationName = "closing-in";
      }

      if(window.innerWidth < 769 && chatWindow.className.includes('page-turn') === true) {
        notifyText.click();
      }
    });

    notifyText.addEventListener('click', function(event) {
      notifyText.style.transform = "translateX(-100%)";
    });

   userListForPrivateChat.addEventListener('click', function(event) {
     let userToChatWith;
     let isUserObjPresent = false;
     let roomName = document.getElementById('room-name');
     let roomHeaderImage = document.getElementById('room-profile-pic');

     if(event.target.parentElement === userListForPrivateChat) {
        userToChatWith = event.target.children[1].childNodes[0].textContent;
        roomHeaderImage.src = event.target.children[0].src;
     } else if (event.target.parentElement.id === "user-name") {
        userToChatWith = event.target.parentElement.firstChild.textContent;
        roomHeaderImage.src = event.target.parentElement.previousElementSibling.src;
     } else if(event.target.parentElement.className === "user") {
        userToChatWith = event.target.parentElement.children[1].childNodes[0].textContent;
        roomHeaderImage.src = event.target.parentElement.children[0].src;
     }  
     
     if(userToChatWith === undefined) {
       return;
      } 
      roomName.textContent = userToChatWith;
      //check textContent of the notification element of the clicked element in the private chat list
      for (let child of userListForPrivateChat.children) {
        if(child.lastChild.firstElementChild !== undefined && child.lastChild.firstElementChild.textContent !== "" && child.lastChild.firstChild.textContent === roomName.textContent){
          unreadMsgs[child.lastChild.firstChild.textContent].unreadMsgCount = 0;
          child.lastChild.firstElementChild.style.display = 'none';
        }
      }

     if(messages.length) {
        for(let msgObj of messages) {
          if(msgObj.chatOf === userToChatWith) {
            conversationContainer.innerHTML = msgObj.messages.join("");
            isUserObjPresent = true;
          }
         }
      } 
     if(userToChatWith === 'General') {
         isUserObjPresent = true;
         conversationContainer.innerHTML = generalRoomConversation.join("");
      }
     if(!isUserObjPresent) {
        conversationContainer.innerHTML = '<div></div>';
      }
      conversationContainer.scrollTop = conversationContainer.scrollHeight + 5; 
      if(window.innerWidth < 769) {
        let messageIcon = document.querySelector('.fa-message');
        let groupIcon = document.querySelector('.fa-user-group');
        chatWindow.classList.remove("page-turn");
        groupIcon.parentElement.classList.remove('selected');
        messageIcon.parentElement.classList.add('selected');
      }
   });

   if(avatarContainer) {
   //selection of avatar from the avatar container 
   avatarContainer.addEventListener("click", function(event) {
     let clickedElement = event.target;
     if(clickedElement.className === "avatar") {
       selectedAvatar.style.opacity = "1";
       confirmAvatarButton.style.opacity = "1";
       selectedAvatar.attributes[1].value = clickedElement.attributes[1].value;
       document.querySelector(".selected-avatar").lastElementChild.textContent = "Avatar selected.";
     }
   })
  
   //event listener on a button to confirm the user's selected avatar 
   confirmAvatarButton.addEventListener('click', function(event) {
      if(selectedAvatar.attributes[1].textContent) {
        profileImage.src = selectedAvatar.attributes[1].textContent;
        avatarContainer.firstElementChild.style.animationName = "rotate-spin-slide";
        
        setTimeout(function() {
          avatarContainer.style.display = "none";
        }, 1150);
      } 
   });
  };

   //listening to and emitting socket events
   socket.emit('new user', {user: user.textContent,  socketID: ""});

   socket.on('user image', function({userImagesObject}) {
     for(let child of userListForPrivateChat.children) {
       let childContentValue = child.lastElementChild.firstChild.textContent;
       if(userImagesObject.hasOwnProperty(childContentValue)) {
         child.firstChild.src = userImagesObject[childContentValue];
       }

     }
   })

   socket.on("new user", function(data) { 
     let listElements = "";
     let listOfUsersToChat = []; 
     let connectedSocketUsers = data.arrayOfConnectedUsers.filter(username => {
       return username !== user.textContent;
     });
     let numOfPreviousUnreadGeneralMsgs = generalRoomConversation.length;
     
     if(!unreadMsgs.General) {
     unreadMsgs.General = {unreadMsgCount: 0};
     unreadMsgs.General.unreadMsgCount = data.generalRoom.length - generalRoomConversation.length;
     } 

     listOfUsersToChat.push(`<div class="user"><img id="user-image" src="./images/people-group-avatar.png" alt=""><div id="user-name">General<span class="message_notification" style="display:inline;">${unreadMsgs.General.unreadMsgCount}</span><br><em>General Chat-room.</em></div></div>`);
     generalRoomConversation = data.generalRoom;
     
     if(!connectedSocketUsers.length) {
       activeList.innerHTML = `<p>No active users</p>`;
     }
   
     if(activeList.firstElementChild.textContent === "No active users" && connectedSocketUsers.length !== 0) {
       activeList.removeChild(activeList.firstElementChild);
     }
     
     if(connectedSocketUsers.length !== 0) {
     for (let user of connectedSocketUsers) { 
       listElements += `<li>${user}</li>`;
       if(unreadMsgs[user] && unreadMsgs[user].unreadMsgCount !== 0) {
         
       listOfUsersToChat.push(`<div class="user"><img id="user-image" src=${user.userImage} alt=""><div id="user-name">${user}<span class="message_notification" style="display:inline;">${unreadMsgs[user].unreadMsgCount}</span><br><em>Click for private chat.</em></div></div>`);
      } else {
       listOfUsersToChat.push(`<div class="user"><img id="user-image" src=${user.userImage} alt=""><div id="user-name">${user}<span class="message_notification"></span><br><em>Click for private chat.</em></div></div>`);
      }
     }
     activeList.innerHTML = listElements;
     userListForPrivateChat.innerHTML = listOfUsersToChat.join("");
   
   }

   if(chatEntity.lastElementChild.textContent === 'General') {
    unreadMsgs.General.unreadMsgCount = 0;
    listOfUsersToChat[0] = `<div class="user"><img id="user-image" src="./images/people-group-avatar.png" alt=""><div id="user-name">General<span class="message_notification" style="display:none;"></span><br><em>General Chat-room.</em></div></div>`;
    userListForPrivateChat.innerHTML = listOfUsersToChat.join("");
    conversationContainer.innerHTML = generalRoomConversation.join("");
    conversationContainer.scrollTop = conversationContainer.scrollHeight + 5;
   } else {
     unreadMsgs.General.unreadMsgCount += data.generalRoom.length - numOfPreviousUnreadGeneralMsgs;
     console.log(unreadMsgs.General.unreadMsgCount, data.generalRoom.length, generalRoomConversation.length);
     listOfUsersToChat[0] = `<div class="user"><img id="user-image" src="./images/people-group-avatar.png" alt=""><div id="user-name">General<span class="message_notification" style="display:inline;">${unreadMsgs.General.unreadMsgCount}</span><br><em>General Chat-room.</em></div></div>`
     userListForPrivateChat.innerHTML = listOfUsersToChat.join("");
   }
 });

 socket.on('on user-disconnection', function({ activeUsersList, generalRoom }) {
    let listElements = "";
    let activeUsers = activeUsersList.filter(username => {
      return username !== user.textContent;
    });

    for (let user of activeUsers) {
      listElements += `<li>${user}</li>`;
    }

    unreadMsgs.General.unreadMsgCount += generalRoom.length - generalRoomConversation.length;
    userListForPrivateChat.firstChild.children[1].firstElementChild.style.display = "inline";
    userListForPrivateChat.firstChild.children[1].firstElementChild.textContent = unreadMsgs.General.unreadMsgCount;

    activeList.innerHTML = listElements;
    generalRoomConversation = generalRoom;
   
    if(!activeUsers.length) {
      activeList.innerHTML = `<p>No active users</p>`;
    }
    
    if(chatEntity.lastElementChild.textContent === 'General') {
      userListForPrivateChat.firstChild.children[1].firstElementChild.style.display = "none";
      conversationContainer.innerHTML = generalRoomConversation.join("");
    }
 });

 socket.on('general', function(data) {
   let generalChat = [];

   for(let item of data.general) {
     let regex = new RegExp(user.textContent + ':');
     if(regex.test(item)) {
       generalChat.push(item.replace(regex, 'You:'));
     } else {
       generalChat.push(item);
     }
   }
   
   if(unreadMsgs.General) {
     unreadMsgs.General.unreadMsgCount += data.general.length - generalRoomConversation.length; 
     userListForPrivateChat.firstElementChild.children[1].firstElementChild.textContent = unreadMsgs.General.unreadMsgCount;
     userListForPrivateChat.firstElementChild.children[1].firstElementChild.style.display = "inline";
     if(chatWindow.className.includes('page-turn') === false && chatEntity.lastElementChild.textContent !== 'General') {
      notifyText.style.transform = 'translateX(0%)';
    }
   } else {
     unreadMsgs.General = { unreadMsgCount: 0 };
     unreadMsgs.General.unreadMsgCount += data.general.length - generalRoomConversation.length;
     userListForPrivateChat.firstElementChild.children[1].firstElementChild.textContent = unreadMsgs.General.unreadMsgCount;
     userListForPrivateChat.firstElementChild.children[1].firstElementChild.style.display = "inline";
   }

   generalRoomConversation = generalChat;

   if(chatEntity.lastElementChild.textContent === 'General') {
     unreadMsgs.General.unreadMsgCount = 0;
     userListForPrivateChat.firstElementChild.children[1].firstElementChild.textContent = unreadMsgs.General.unreadMsgCount;
     userListForPrivateChat.firstElementChild.children[1].firstElementChild.style.display = "none";
    conversationContainer.innerHTML = generalRoomConversation.join("");
   }
   conversationContainer.scrollTop = conversationContainer.scrollHeight + 5;
 });

 socket.on('private chat', function({ sender, senderText }) {
   let privateUserConversation;
   let isUserObjPresent = false;
   if(!unreadMsgs[sender]) {
     unreadMsgs[sender] = {unreadMsgCount: 0};
   }
    if(messages.length) {

     for(let msgObj of messages) {
       if(msgObj.chatOf === sender) {
         msgObj.messages.push(`<p class="left"><span class="left-text">${senderText}</span></p>`);
         isUserObjPresent = true;
         privateUserConversation = msgObj.messages.slice("");
         }
        }
       } 
       if(!isUserObjPresent) {
         let messageFrom = {chatOf: sender};
         messageFrom.messages = [`<p class="left"><span class="left-text">${senderText}</span></p>`];
         messages.push(messageFrom);
         privateUserConversation = messageFrom.messages.slice("");
     }
     if(privateUserConversation.length) {
       if(sender === chatEntity.lastElementChild.textContent) {
         unreadMsgs[sender].unreadMsgCount = 0;
         conversationContainer.innerHTML = privateUserConversation.join("");
         conversationContainer.scrollTop = conversationContainer.scrollHeight + 5;
       } else {
         unreadMsgs[sender].unreadMsgCount++;
         for (let child of userListForPrivateChat.children) {
           if(child.lastElementChild.firstChild.textContent === sender) {
             child.lastElementChild.childNodes[1].textContent = unreadMsgs[sender].unreadMsgCount;
             child.lastElementChild.childNodes[1].style.display = "inline";
           }
         }
         if(chatWindow.className.includes('page-turn') === false) {
          notifyText.style.transform = 'translateX(0%)';
         }
       }
     }
   });