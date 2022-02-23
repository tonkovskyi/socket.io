exports.getRoom = (io, roomName) => {
  const room = io.sockets.adapter.rooms.get(roomName);
  if (room) return [...room];
  return false;
};

exports.roomIsFull = async (room) => {
  if (room && room.length >= 2)
    return {
      type: "error",
      payload: {
        message: "Room is full",
      },
    };
  return false;
};