const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fetch = require("node-fetch");
const fs = require("fs");
const port = process.env.PORT || 4001;
const app = express();
const sensors = JSON.parse(fs.readFileSync(`${process.cwd()}/sensors/sensors.json`, "utf8"));
const router = express.Router();
const sensorList = router.get("/", (req, res) => {
  res.send(sensors).status(200);
});

app.use(sensorList);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

http.createServer(app).listen(4000, () => sensors);

const emit = async (socket, sensor) => {
  try {
    const endpointBase = "http://www.adamglang.com/projects/planeSightServer/sensors/";
    const sensorEndpoint = `${endpointBase}${sensor}.json`;
    const res = await fetch(sensorEndpoint);
    const json = await res.json();

    socket.emit(`From::${sensor}`, json);
  } catch (error) {
    console.error(`There was an error from ${sensor}: ${error}`);
  }
};

for(const [idx, sensor] of sensors.entries()) {
  const server = http.createServer(app);
  const socket = socketIo(server);
  const sensorPort = port + idx;
  const connectionMessage = `New client connected to ${sensor}`;
  const disconnectMessage = `Client disconnected from ${sensor}`;
  const listeningMessage = `Listening for data from ${sensor} sensor on port ${sensorPort}`;

  socket.on("connection", socket => {
    console.log(connectionMessage);
    setInterval(() => emit(socket, sensor), 1000);
  });

  socket.on("disconnect", () => console.log(disconnectMessage));

  server.listen(sensorPort, () => console.log(listeningMessage));
}