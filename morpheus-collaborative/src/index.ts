import express from "express";
import http from "http";
import debug from "debug";
const socketIO = require("socket.io");
const cors = require("cors");

const serverDebug = debug("server");
const ioDebug = debug("io");
const socketDebug = debug("socket");

require("dotenv").config(
    process.env.NODE_ENV !== "development"
        ? {path: ".env.production"}
        : {path: ".env.development"},
);

const app = express();
const port = process.env.PORT || 80; // default port to listen

app.use(express.static("public"));

// Enable CORS
const allowedOrigins = ["https://morpheus.monadical.io", "http://localhost:3000"];
app.use(cors({
  origin: allowedOrigins,
}));

app.get("/", (req: any, res: any) => {
  res.send("Morpheus collaborative server is up :)");
});

const server = http.createServer(app);

server.listen(port, () => {
  serverDebug(`listening on port: ${port}`);
});

const io = socketIO(server, {
  wsEngine: "ws",
  transports: ["websocket", "polling"],
  handlePreflightRequest: (req: any, res: any) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin":
          (req.header && req.header.origin) || "https://morpheus.monadical.io",
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});

io.on("connection", (socket: any) => {
  ioDebug("connection established!");
  io.to(`${socket.id}`).emit("init-room");
  socket.on("join-room", (roomID: any) => {
    socketDebug(`${socket.id} has joined ${roomID}`);
    socket.join(roomID);
    if (io.sockets.adapter.rooms[roomID].length <= 1) {
      io.to(`${socket.id}`).emit("first-in-room");
    } else {
      socket.broadcast.to(roomID).emit("new-user", socket.id);
    }
    io.in(roomID).emit(
        "room-user-change",
        Object.keys(io.sockets.adapter.rooms[roomID].sockets),
    );
  });

  socket.on(
      "server-broadcast",
      (roomID: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
        socketDebug(`${socket.id} sends update to ${roomID}`);
        socket.broadcast.to(roomID).emit("client-broadcast", encryptedData, iv);
      },
  );

  socket.on(
      "server-volatile-broadcast",
      (roomID: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
        socketDebug(`${socket.id} sends volatile update to ${roomID}`);
        socket.volatile.broadcast
            .to(roomID)
            .emit("client-broadcast", encryptedData, iv);
      },
  );

  socket.on("disconnecting", () => {
    const rooms = io.sockets.adapter.rooms;
    for (const roomID in socket.rooms) {
      const clients = Object.keys(rooms[roomID].sockets).filter(
          (id) => id !== socket.id,
      );
      if (clients.length > 0) {
        socket.broadcast.to(roomID).emit("room-user-change", clients);
      }
    }
  });

  socket.on("disconnect", () => {
    socket.removeAllListeners();
  });
});
