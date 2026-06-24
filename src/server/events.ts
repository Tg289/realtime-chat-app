import { Server, Socket } from "socket.io";

const onlineUsers = new Map<
  string,
  string
>();

export function registerEvents(
  io: Server,
  socket: Socket
) {
  socket.on(
    "user-online",
    (userId: string) => {
      onlineUsers.set(
        userId,
        socket.id
      );

      io.emit(
        "online-users",
        Array.from(
          onlineUsers.keys()
        )
      );
    }
  );

  socket.on(
    "join-room",
    (roomId: string) => {
      socket.join(roomId);
    }
  );

  socket.on(
    "send-message",
    (data) => {
      io.to(data.roomId).emit(
        "receive-message",
        data
      );
    }
  );

  socket.on(
    "typing",
    (data) => {
      socket
        .to(data.roomId)
        .emit("typing", data);
    }
  );

  socket.on(
    "read-message",
    (data) => {
      io.to(data.roomId).emit(
        "message-read",
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
          socketId === socket.id
        ) {
          onlineUsers.delete(
            userId
          );
          break;
        }
      }

      io.emit(
        "online-users",
        Array.from(
          onlineUsers.keys()
        )
      );
    }
  );
}