const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(cors());

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
        console.log("here", users, private);
        if (users[roomID] && private) {

            const length = users[roomID].length;
            if (length === 2) {
                socket.emit("room full");
                return;
            }

            let name = Math.floor(Math.random() * 50) + 1;
            users[roomID].push(socket.id);
            usersNames[roomID].push(name)


        } else if (private) {
            users[roomID] = [socket.id];
            let name = Math.floor(Math.random() * 50) + 1
            usersNames[roomID] = [name]
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        const usersNamesInThisRoom = usersNames[roomID].filter(id => id !== socket.id);
        socket.emit("all users", {usersInThisRoom,usersNamesInThisRoom});
    });

    socket.on("join room using ip", (roomID) => {
        console.log("here", users);
        if (users[roomID]) {

            const length = users[roomID].length;
            if (length === 5) {
                socket.emit("room full");
                return;
            }

            let name = Math.floor(Math.random() * 50) + 1;
            users[roomID].push(socket.id);
            usersNames[roomID].push(name)

        } else {

            users[roomID] = [socket.id];
            let name = Math.floor(Math.random() * 50) + 1
            usersNames[roomID] = [name]

        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        const usersNamesInThisRoom = usersNames[roomID].filter(id => id !== socket.id);
        socket.emit("all users", {usersInThisRoom,usersNamesInThisRoom});
    });

    socket.on("sending signal", payload => {
        const roomID = socketToRoom[socket.id];
        const usersNamesInThisRoom = usersNames[roomID].filter(id => id !== socket.id);
        socket.emit("usernames", usersNamesInThisRoom);
        io.to(payload.userToSignal).emit('user joined', {
            signal: payload.signal,
            callerID: payload.callerID,
            username: payload.username
        });
    });

    socket.on("returning signal", payload => {
        const roomID = socketToRoom[socket.id]; 
        const usersNamesInThisRoom = usersNames[roomID].filter(id => id !== socket.id);
        socket.emit("usernames", usersNamesInThisRoom);
        io.to(payload.callerID).emit('receiving returned signal', {
            signal: payload.signal,
            id: socket.id,
            username: payload.username
        });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];

        
        let pos
        let room = users[roomID];
        console.log("left room here",users[roomID]);
        if (room) {
            room.forEach((id,index) =>  id == socket.id?pos=index:0);
            room = room.filter((id,index) =>  id !== socket.id);
            users[roomID] = room;
            console.log("jthe position",pos);
            usersNames[roomID] = usersNames[roomID].filter((item,index)=> index!==pos)
            const usersNamesInThisRoom = usersNames[roomID].filter((id,index) => index !==pos);
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

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));

