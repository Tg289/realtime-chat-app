const { Server } = require("socket.io");

const io = new Server(4000, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(
    "User Connected:",
    socket.id
  );

  socket.on(
    "join-room",
    (roomId) => {
      socket.join(roomId);

      console.log(
        "Joined Room:",
        roomId
      );
    }
  );

  socket.on(
    "user-online",
    (userId) => {
      onlineUsers.set(
        userId,
        socket.id
      );

      io.emit(
        "online-users",
        {
          users: Array.from(
            onlineUsers.keys()
          ),
          count:
            onlineUsers.size,
        }
      );
    }
  );

  socket.on(
    "send-message",
    (data) => {
      io.to(
        data.roomId
      ).emit(
        "receive-message",
        data
      );
    }
  );

  socket.on(
    "reaction-updated",
    (data) => {
      io.to(
        data.roomId
      ).emit(
        "reaction-updated",
        data
      );
    }
  );

  socket.on(
    "message-read",
    (data) => {
      io.to(
        data.roomId
      ).emit(
        "message-read",
        data
      );
    }
  );

  socket.on(
    "message-deleted",
    (data) => {
      io.to(
        data.roomId
      ).emit(
        "message-deleted",
        data
      );
    }
  );

  socket.on(
    "typing",
    (data) => {
      socket
        .to(data.roomId)
        .emit(
          "typing",
          data
        );
    }
  );

  socket.on(
    "stop-typing",
    (data) => {
      socket
        .to(data.roomId)
        .emit(
          "stop-typing",
          data
        );
    }
  );

  socket.on(
    "disconnect",
    () => {
      for (const [
        userId,
        socketId,
      ] of onlineUsers) {
        if (
          socketId ===
          socket.id
        ) {
          onlineUsers.delete(
            userId
          );
          break;
        }
      }

      io.emit(
        "online-users",
        {
          users: Array.from(
            onlineUsers.keys()
          ),
          count:
            onlineUsers.size,
        }
      );

      console.log(
        "Disconnected:",
        socket.id
      );
    }
  );
});

console.log(
  "Socket Server Running on Port 4000"
);