exports.game = {
  id: null,
  roomName: null,
  room: null,
  getRoom: async (roomName, io) => {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (room) return [...room];
    return false;
  },
  usersId: {},
  gameStarted: false,
};

exports.games = {};