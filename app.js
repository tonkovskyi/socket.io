require("dotenv").config();
const app = require("express")();
const http = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(http, { cors: { origin: "*" } });

const PORT = process.env.SERVER_PORT || 3001;

require("./socketEvents")(io);

http.listen(PORT, () => {
  console.log(`Server started on port ${process.env.HOST}:${PORT}`);
});