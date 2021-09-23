//Importing modules
const path = require('path');
const http = require('http');
const express = require('express');
const formatMsg = require('./utils/messages');
const {addUser, getUser, getRoomUsers, userleft} = require('./utils/allUsers');

//object for express
const app = express();

// create socket object
const socketIO = require('socket.io');

//creating the server using Express
const server = http.createServer(app);
var io = socketIO(server);
const PORT = Process.env.PORT || 3000 ;

//Join static public folder with the server
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

//Variable for our GapShap bot 
const bot = 'GapShap Bot'


//As soon as you(server) gets a connection, run a arrow fn
//io.on, means ki jabtak connected hai koi 
//socket.on-> when recieves a signal through emit/broadcast, do the task ordered.
//broadcast.emit() jo event karta hai (here joining of chat), usko chorr ke sabko emit kar deta hai
//socket.emit() will emit to the only user who is connecting.
//io.emit() will emit to everybody connected
io.on('connection', socket => {
    //when a user joins the room do the greeting stuff
    socket.on('room-joined',({username, room})=>{
        //create a user with name and room from url, and id from socket-id and add to our users array
        const user = addUser(socket.id, username, room);

        //using room functionality of node, add the user to the room
        socket.join(user.room);

        //Welcome Message for new User
        socket.emit('message', formatMsg(bot,`Welcome ${user.username} to ${user.room} room !<p></p> Now there are ${getRoomUsers(user.room).length} people in this room.`));  

        //only broadcast in user's room, so we use to()
        socket.broadcast.to(user.room).emit('message', formatMsg(bot, `${user.username} joined the chat!.<p></p> Now there are ${getRoomUsers(user.room).length} people here!.`));  //broadcast kardo userjoined, and with his name

        //Update and Display users and room info in side-bar 
        io.to(user.room).emit('roomUsers',{
            users : getRoomUsers(user.room),
            room : user.room
        });

    });

    
    //catch the textMessage sent by client from main.js
    socket.on('textMessage', msg=>{
        const user = getUser(socket.id);    //get the user who sent the message
        io.to(user.room).emit('message',formatMsg(`${user.username} `,msg));
    });

    //Whenever a user left message chat socket.io fire an 'disconnect' event.
    socket.on('disconnect', message => {                         
        const user = userleft(socket.id);    //get the user who left the message
        if(user){
            socket.broadcast.to(user.room).emit('message', formatMsg(bot,` ${user.username} left the chat ;(<p></p> Now, this room is left with ${getRoomUsers(user.room).length} members!.`));  //Inform other users if someone leaves the chat by triggering user-left event
        }
        //update and Display users and room info in side-bar
        io.to(user.room).emit('roomUsers',{
            users : getRoomUsers(user.room),
            room : user.room  
        });
        
    });
});

server.listen(PORT, ()=> console.log(`server running on port ${PORT}`));