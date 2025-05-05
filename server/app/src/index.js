const http = require("http");
const cors = require("cors");
const express = require("express");
const { Server } = require("socket.io");
const GameManager = require("./classes/game/GameManager");
const socketMiddleware = require("./utils/socketMiddleware");
const PlayerManager = require("./classes/player/PlayerManager");

const app = express();
const gameManager = new GameManager();
const playerManager = new PlayerManager();
const PORT = process.env.REACT_APP_SERVER_PORT || 5000;

app.use(cors());
app.get("/", (req, res) => {
  res.send("Socket.IO server is running");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
  },
});


io.use((socket, next) => {
  next();
});

io.on("connection", (socket) => {
  socketMiddleware(socket, io, gameManager, playerManager);
});

server.listen(PORT, () => {
  console.log("Socket.IO server running on http://" + process.env.REACT_APP_HOST_IP + ":" + PORT);
});


