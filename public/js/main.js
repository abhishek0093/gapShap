const messageContainer = document.querySelector(".Msgs-wrapper")
const roomName = document.getElementById('room-name');
const roomUsersName = document.getElementById('users');
const messageForm = document.getElementById('chatBox');

var socket = io();

//To extract the username and roomName from URL we use qs-cdn(query-string) library, and using destructuring
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix : true   //To ignore those unwanted symbols like ?,% in url
})


//User joins a room, so emit room-joined event
socket.emit('room-joined', {username,room});

//Update and display users and room Information
socket.on('roomUsers', ({users, room}) =>{
    showRoom(room);
    showUsers(users);
})

socket.on('message', message =>{
    append(message);

    // scroll the screen also
    messageContainer.scrollTop = messageContainer.scrollHeight;
})

// //On incoming of message play our tune
// let tune = new Audio('tune_chat.mp3');


//Whenver we submit the message form, i.e send button clicked
messageForm.addEventListener('submit', e=>{
    //Prevents reloading of page O/w it will again prompt for joining credeitinal
    e.preventDefault();

    //extracting the typed message of the chatBox using id = msg;
    const msg = e.target.elements.msg.value;

    //emit the message to our server
    socket.emit('textMessage',msg);

    //clear the text box
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();      //keep the focus on text-box

})

//appends the message on the screen
function append(message){
    const messageElement = document.createElement('div');
    messageElement.classList.add('textMsgs');       //Inki classes mein append kardo sabhi ke liye
    messageElement.innerHTML = `<p class="meta">${message.user}<span> ${message.time}</span></p>
    <p class="Msg">
        ${message.msg}
    </p>`;

    //Insert our new-message into the message-container section
    messageContainer.appendChild(messageElement);
}

// show the room Name in sideBar
function showRoom(room){
    roomName.innerText = room;
}

//show users in side
function showUsers(users){      //users is a list, so what we do is map. For every user map it to a string of li 
    roomUsersName.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}