const commandController = require("../controllers/socket.command.controller");

const router = async (user) => {
  switch (user.message.type) {
    case "create_game":
      user.message = await commandController.createGame(user);
      commandController.joinGame(user);
      break;
    case "join_game":
      commandController.joinGame(user);
      break;
    case "leave_game":
      commandController.leaveGame(user);
      break;
    default:
      break;
  }
};

module.exports = router;