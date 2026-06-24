"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export default function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    socket.on(
      "online-users",
      (users: string[]) => {
        setOnlineUsers(users);
      }
    );

    return () => {
      socket.off("online-users");
    };
  }, []);

  return onlineUsers;
}