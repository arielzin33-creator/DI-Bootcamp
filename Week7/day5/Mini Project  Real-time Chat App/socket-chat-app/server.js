const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

// Local memory mapping layout state for matching context profiles on pipeline channels
let activeUsers = [];

function userJoin(id, username, room) {
    const user = { id, username, room };
    activeUsers.push(user);
    return user;
}

function getCurrentUser(id) {
    return activeUsers.find(user => user.id === id);
}

function userLeave(id) {
    const index = activeUsers.findIndex(user => user.id === id);
    if (index !== -1) {
        return activeUsers.splice(index, 1)[0];
    }
}

function getRoomUsers(room) {
    return activeUsers.filter(user => user.room === room);
}

function formatMessage(username, text) {
    return {
        username,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}

// Server full-duplex socket execution layer loop orchestration
io.on('connection', (socket) => {
    
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Broadcast system alerts to joining profile individual frame pipeline
        socket.emit('message', formatMessage('System', `Welcome to the "${user.room}" chat hub!`));

        // Broadcast notification alerts to all users inside target specific room frame channels
        socket.broadcast.to(user.room).emit('message', formatMessage('System', `${user.username} joined the conversation.`));

        // Emit updated participant list structures
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Capture explicit communication messaging frames
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, msg));
        }
    });

    // Capture connection termination drops/teardowns implicitly
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage('System', `${user.username} departed the conversation.`));
            
            // Re-broadcast adjusted user registry pipelines
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Real-Time Socket Cluster active on port ${PORT}`));
