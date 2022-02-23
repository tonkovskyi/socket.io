const util = require("../services/command.util");
const gameModel = require("../models/game.model");
const userModel = require("../models/user.model");
const random = require("../services/randomFunction");
const { v4: uuidv4 } = require("uuid");

class CommandController {
  async inintial(socket, user, io) {
    socket.join("command");
    user.id = uuidv4();
    console.log(`User connected ${user.id}`);
    user.io = io;
    user.socket = socket;
    userModel.users[user.id] = user;
    socket.emit("/command", {
      type: "wellcome",
      payload: {
        userId: user.id,
      },
    });
  }

  async createGame(user) {
    const game = { ...gameModel.game };
    game.id = random(4);
    game.roomName = `/game/${game.id}`;

    gameModel.games[game.id] = game;

    user.socket.emit("/command", {
      type: "game_created",
      payload: {
        gameId: game.id,
      },
    });

    return {
      payload: {
        gameId: game.id,
      },
    };
  }

  async joinGame(user) {
    const game = gameModel.games[user.message.payload.gameId];
    if (!game) {
      return user.socket.emit("/command", {
        type: "error",
        payload: {
          message: "game not exist",
        },
      });
    }
    game.room = await game.getRoom(game.roomName, user.io);

    const roomIsFull = await util.roomIsFull(game.room);
    if (roomIsFull) return user.socket.emit("/command", roomIsFull);

    user.socket.emit("/command", {
      type: "game_joined",
      payload: {
        gameId: game.id,
      },
    });

    user.socket.join(game.roomName);
    user.game = game;
    user.game.usersId[user.socket.id] = user.id;
    if (user.game.room && user.game.room.length === 1) {
      user.io.to(user.game.roomName).emit("/game", {
        type: "start_game_phase",
        payload: {
          message: "prepare for battle",
        },
      });
    }
  }
  async leaveGame(user) {
    if (!user.game) {
      return user.socket.emit("/command", {
        type: "error",
        payload: {
          message: "game not exist",
        },
      });
    }

    user.game.room = await user.game.getRoom(user.game.roomName, user.io);
    user.game.room = user.game.room.filter((f) => f !== user.socket.id);

    if (
      user.game.room &&
      user.game.room.length === 1 &&
      user.game.gameStarted === true
    ) {
      const enemyId = await user.getEnemyId(user);
      const enemy = userModel.users[enemyId];

      user.socket.emit("/game", {
        type: "game_result",
        payload: {
          message: "You Lose",
        },
      });

      enemy.socket.emit("/game", {
        type: "game_result",
        payload: {
          message: "You Win",
        },
      });
    }

    user.socket.leave(user.game.roomName);

    if ((user.game.room && user.game.room.length === 0) || !user.game.room) {
      delete gameModel.games[user.game.id];
    }
    delete user.game;
  }
}

module.exports = new CommandController();