exports.user = {
  id: null,
  io: null,
  socket: null,
  message: null,
  game: null,
  ships: null,
  hit: null,
  getEnemyId: async (user) => {
    const enemySocket = user.game.room.filter(
      (userSocket) => userSocket !== user.socket.id
    );
    return user.game.usersId[enemySocket];
  },
};

exports.users = {};