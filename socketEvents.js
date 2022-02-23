const userModel = require("./models/user.model");
const commandController = require("./controllers/socket.command.controller");
const command = require("./routes/socket.command.router");
const game = require("./routes/socket.game.router");

const socketEvents = (io) => {
  io.on("connection", (socket) => {
    const user = { ...userModel.user };
    commandController.inintial(socket, user, io);

    socket.on("/command", async (message) => {
      user.message = message;
      command(user);
    });

    socket.on("/game", async (message) => {
      user.message = message;
      game(user);
    });
    socket.on("disconnect", () => {
      console.log(`User disconnected ${user.id}`);
    });
  });
};

module.exports = socketEvents;
