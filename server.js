const http = require('http');
require('dotenv').config()
const express = require('express');
const socketio = require('socket.io');
var bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const route = require('./Route/index');
const adminRouter = require('./Route/admin.router')
const MONGO_URL =process.env.MONGO_URL || 'yourMongoUrl' 
app.use(cors());
app.use('/admin', adminRouter) 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(route);


const users = {};
const usersNames = {};
const usersOnSameNetwork = {};

const socketToRoom = {};

app.get("/", (req, res) => {
    res.send({
        response: "Server is up and running.",
        users,
        usersNames
    }).status(200);
});

io.on('connection', socket => {
    socket.on("join room", (roomID, private) => {

        if (users[roomID] && private) {

            const length = users[roomID].length;
            if (length === 2) {
                socket.emit("room full");
                return;
            }

            let name = Math.floor(Math.random() * 50) + 1;
            users[roomID].push(socket.id);
            usersNames[roomID].push({id:socket.id,name})


        } else if (private) {
            users[roomID] = [socket.id];
            let name = Math.floor(Math.random() * 50) + 1
            usersNames[roomID] = [{id:socket.id,name}];
            const usersNamesInThisRoom = usersNames[roomID]
            socket.emit("usernames", usersNamesInThisRoom);
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        const usersNamesInThisRoom = usersNames[roomID]
        socket.emit("usernames", usersNamesInThisRoom);
        socket.emit("all users", {usersInThisRoom,usersNamesInThisRoom});
    });

    socket.on("join room using ip", (roomID) => {
        if (users[roomID]) {

            const length = users[roomID].length;
            if (length === 5) {
                socket.emit("room full");
                return;
            }

            let name = Math.floor(Math.random() * 50) + 1;
            users[roomID].push(socket.id);
            usersNames[roomID].push({id:socket.id,name})

        } else {

            users[roomID] = [socket.id];
            let name = Math.floor(Math.random() * 50) + 1
            usersNames[roomID] = [{id:socket.id,name}]

        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        const usersNamesInThisRoom = usersNames[roomID].filter(id => id.name !== socket.id);
        socket.emit("all users", {usersInThisRoom,usersNamesInThisRoom});
    });

    socket.on("sending signal", payload => {
        const roomID = socketToRoom[socket.id];
        const usersNamesInThisRoom = usersNames[roomID]
        socket.emit("usernames", usersNamesInThisRoom);
        io.to(payload.userToSignal).emit('user joined', {
            signal: payload.signal,
            callerID: payload.callerID,
            username:payload.username
        });
    });

    socket.on("returning signal", payload => {
        const roomID = socketToRoom[socket.id]; 
        const usersNamesInThisRoom = usersNames[roomID].filter(id => id.name !== socket.id);
        socket.emit("usernames", usersNamesInThisRoom);
        io.to(payload.callerID).emit('receiving returned signal', {
            signal: payload.signal,
            id: socket.id,
            username:payload.username
        });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];

        
        let pos
        let room = users[roomID];
        if (room) {
            room.forEach((id,index) =>  id == socket.id?pos=index:0);
            room = room.filter((id,index) =>  id !== socket.id);
            users[roomID] = room;
 
            usersNames[roomID] = usersNames[roomID].filter((item,index)=> index!==pos)
            if(users[roomID].length===0){
            delete users[roomID]
            delete usersNames[roomID]
            }else {
            const returningUser = users[roomID][0]
            const returningUsers = users[roomID]
            io.to(returningUser).emit('user left', {
                signal: "user left"
            });
            returningUsers.forEach(item => io.to(item).emit('usernames',usersNames[roomID]))
            returningUsers.forEach(item => io.to(item).emit('user left', {
                signal: "user left"
            }));
            
        }
        }
    });

});

const run = async() =>{
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true
      })
server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));
}

run()
