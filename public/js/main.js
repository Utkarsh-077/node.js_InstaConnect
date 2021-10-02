const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomname = document.getElementById('room-name');
const userList = document.getElementById('users');

// get username and room from url
const{username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();

//join chatroom
socket.emit('joinRoom', { username, room });

// get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUserName(users);


});

//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
    //scroller
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

chatForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    
    const msg = e.target.elements.msg.value;
    //emit message to server
    socket.emit('chatMessage', msg);

    //clear input
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();


});

//output messae to dom
function outputMessage(message) {
    const div  = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span></p><p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);

};

//output room to the dom
function outputRoomName(room){
    roomname.innerText = room;

}
//output users to the dom
function outputUserName(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}
