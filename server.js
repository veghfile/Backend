var express = require('express'),
    http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
const cors = require('cors');

app.use(cors)

const users = {};

const socketToRoom = {};

io.on('connection', socket => {
    socket.on("join room", roomID => {
        console.log("here",users);
        if (users[roomID]) {
            
            const length = users[roomID].length;
            if (length === 2) {
                socket.emit("room full");
                return;
            }
            console.log(socket.id);
            
            users[roomID].push(socket.id);
            console.log("all users",users);

        } else {
            console.log("host",socket.id,"room",roomID);
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        // console.log("joined",payload);
        
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID,username:payload.username });
    });

    socket.on("returning signal", payload => {
        // console.log(payload);
        
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id ,username:payload.username});
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        console.log("this guy gone",socket.id);
        
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
            socket.broadcast.emit('user left', socket.id);
        }
    });

});

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));

// server.listen(8000, () => console.log('server is running on port 8000'));

