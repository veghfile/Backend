const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(cors());

const users = {};
const usersOnSameNetwork = {};

const socketToRoom = {};

app.get("/", (req, res) => {
    res.send({
        response: "Server is up and running.",
        users
    }).status(200);
});

io.on('connection', socket => {
    socket.on("join room", (roomID, private) => {
        console.log("here", users, private);
        if (users[roomID] && private) {

            const length = users[roomID].length;
            if (length === 2) {
                socket.emit("room full");
                return;
            }
            console.log(socket.id);

            users[roomID].push(socket.id);
            // console.log("all users",users);


        } else if (private) {
            console.log("host", socket.id, "room", roomID);
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("join room using ip", (roomID) => {
        console.log("here", users);
        if (users[roomID]) {

            const length = users[roomID].length;
            if (length === 2) {
                socket.emit("room full");
                return;
            }
            console.log(socket.id);

            users[roomID].push(socket.id);
            // console.log("all users",users);


        } else {
            console.log("host", socket.id, "room", roomID);
            users[roomID] = [socket.id];

        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        // console.log("joined",payload);

        io.to(payload.userToSignal).emit('user joined', {
            signal: payload.signal,
            callerID: payload.callerID,
            username: payload.username
        });
    });

    socket.on("returning signal", payload => {
        // console.log(payload);
        console.log("this is the one", payload.callerID);

        io.to(payload.callerID).emit('receiving returned signal', {
            signal: payload.signal,
            id: socket.id,
            username: payload.username
        });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        console.log("this guy gone", socketToRoom[socket.id]);

        let room = users[roomID];
        console.log("left room here",users[roomID]);
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
            if(users[roomID].length===0){
            delete users[roomID]
            }else {
            const returningUser = users[roomID][0]
            console.log(socketToRoom);
            // socket.broadcast.emit('user left', socket.id);
            io.to(returningUser).emit('user left', {
                signal: "user left"
            });
        }
        }
    });

});

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));

// server.listen(8000, () => console.log('server is running on port 8000'));