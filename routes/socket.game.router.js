const gameController = require("../controllers/socket.game.controller");

const router = async (user) => {
  switch (user.message.type) {
    case "finish_game_phase":
      gameController.shipsPlaces(user);
      break;
    case "shoot":
      gameController.shoot(user);
      break;
    default:
      break;
  }
};

module.exports = router;