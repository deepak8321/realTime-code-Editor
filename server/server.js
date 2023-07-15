const express = require('express')
const app = express();
const http = require('http');
const {Server}  = require('socket.io');
const ACTIONS = require('../src/Actions');

const server = http.createServer(app);
const io = new Server(server);

// ******* for Deployment******
const path = require('path');
const buildPath = path.join(__dirname, '../build');
// console.log(buildPath);
// build ke andar HTML file hoga to already pick ho jayega on deployment
app.use(express.static(buildPath))
// check on localhost: 5000

// global middleware har request par(refresh karne par error nahi aaye ga)
app.use((req,res, next)=>{
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
})

// memory ke andaar store kar rahe hai server restart hoga to gayab ho gaya
const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

// jab connection bannega tab socket wala  function call hoga
// socket--> client ki information store hoti hai
io.on('connection', (socket)=>{
    console.log('socket connected',socket.id);

    // Event ko Listen jar rahe hai frontend se aa raha
    // sabhi user ki socket ko store kar rahe hai 
    socket.on(ACTIONS.JOIN,({roomId,username})=>{
        userSocketMap[socket.id] = username; // array me store ho raha hai
        socket.join(roomId); // user ko join karna hai room ke andar
        const clients = getAllConnectedClients(roomId) // list banna rahe hai jo user join hai
        // console.log(clients);
        // sabhi user ko inform kare ga kon join ho raha hai 
        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            })
        })
    })

    // code change listen ho rah hai
    socket.on(ACTIONS.CODE_CHANGE, ({roomId,code}) => {
        // console.log('reciveing',code);
        // code send kar rahe hai
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {code});
    })

    // jab koi new user join hoge tab pahle vala code sync ho jaye
    socket.on(ACTIONS.SYNC_CODE, ({socketId,code}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code});
    })

    socket.on('disconnecting', ()=>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId)=> {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            })
        });
        delete userSocketMap[socket.id];
        socket.leave();
    })
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=>{
    console.log(`Listing on port ${PORT}`);
})