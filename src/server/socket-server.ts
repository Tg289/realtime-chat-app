import { Server } from "socket.io";

let io: Server;

export function getIO() {
  if (!io) {
    io = new Server({
      cors: {
        origin: "*",
      },
    });
  }

  return io;
}