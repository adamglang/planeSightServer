const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fetch = require("node-fetch");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();

app.use(index);

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", socket => {
  console.log("New client connected");
  setInterval(() => getApiAndEmit(socket), 10000);
  socket.on("disconnect", () => console.log("Client disconnected"));
});

const getApiAndEmit = async socket => {
  try {
    const gyroscope = "http://www.mocky.io/v2/5b6fc5562e00002c00936580";
    const res = await fetch(gyroscope);

    socket.emit("FromAPI", res);
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

server.listen(port, () => console.log(`Listening on port ${port}`));