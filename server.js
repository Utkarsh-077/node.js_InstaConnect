const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//set static folders
app.use(express.static(path.join(__dirname, 'public')));

const botName = ' ';
//run when client connect
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) =>{

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);


    //welcome new user
    socket.emit('message', formatMessage(botName, 'Welcome to InstaConnect!'));

    //broadcast when user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));
    
    //send user and room information
    io.to(user.room).emit('roomUsers',{
        room : user.room,
        users : getRoomUsers(user.room)
    });
    });
    
    
    // listen for chat message
    socket.on('chatMessage', (msg) =>{

        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    //runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

    //send user and room information
        io.to(user.room).emit('roomUsers',{
        room : user.room,
        users : getRoomUsers(user.room)
    });
        }

        
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log('server is running on port ' + PORT));


