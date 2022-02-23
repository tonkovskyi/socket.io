const userModel = require("../models/user.model");

class GameController {
  async shipsPlaces(user) {
    if (!user.game) {
      return user.socket.emit("/command", {
        type: "error",
        payload: {
          message: "game not exist",
        },
      });
    }

    user.ships = user.message.payload.playerBoard;
    user.game.room = await user.game.getRoom(user.game.roomName, user.io);
    const enemyId = await user.getEnemyId(user);

    if (
      user.game.room &&
      user.game.room.length === 2 &&
      user.ships &&
      userModel.users[enemyId].ships
    ) {
      user.game.gameStarted = true;

      user.io.to(user.game.roomName).emit("/game", {
        type: "game_started",
        payload: {
          users: [user.id, enemyId],
        },
      });
    }
  }
  async shoot(user) {
    if (!user.game) {
      return user.socket.emit("/command", {
        type: "error",
        payload: {
          message: "game not exist",
        },
      });
    }

    if (!user.game.gameStarted) {
      return user.socket.emit("/command", {
        type: "error",
        payload: {
          message: "game not started",
        },
      });
    }

    const enemyId = await user.getEnemyId(user);
    const enemy = userModel.users[enemyId];

    const shipX = parseInt(user.message.payload.shoot.x);
    const shipY = parseInt(user.message.payload.shoot.y);

    const shootRes = enemy.ships.some((ship, index) => {
      if (!ship.shooted) ship.shooted = [];

      let shootRes = false;

      const startCoordinatesX = parseInt(ship.startCoordinates.x);
      const startCoordinatesY = parseInt(ship.startCoordinates.y);

      if (!ship.isVertical) {
        if (
          startCoordinatesX <= shipX &&
          shipX <= startCoordinatesX + (ship.shipLength - 1) &&
          startCoordinatesY === shipY
        ) {
          shootRes = true;
        }
      }
      if (
        startCoordinatesY <= shipY &&
        shipY <= startCoordinatesY + (ship.shipLength - 1) &&
        startCoordinatesX === shipX
      ) {
        shootRes = true;
      }

      if (shootRes) {
        if (
          ship.shipLength === 1 ||
          ship.shooted.length === ship.shipLength - 1
        ) {
          delete enemy.ships[index];
          user.hit++;
          return true;
        }

        const isShooted = ship.shooted.filter(
          (shootedCord) => shootedCord.x === shipX && shootedCord.y === shipY
        );
        ship.shooted.push({ x: shipX, y: shipY });

        if (isShooted.length === 0) {
          user.hit++;
          return true;
        }
      }
    });

    user.io.to(user.game.roomName).emit("/game", {
      type: "shoot_result",
      payload: {
        shoot: user.message.payload.shoot,
        shootResult: shootRes,
        userId: user.id,
      },
    });

    console.log(user.hit);
    if (user.hit === 20) {
      user.socket.emit("/game", {
        type: "game_result",
        payload: {
          message: "You Win",
        },
      });

      enemy.socket.emit("/game", {
        type: "game_result",
        payload: {
          message: "You Lose",
        },
      });
    }
  }
}

module.exports = new GameController();