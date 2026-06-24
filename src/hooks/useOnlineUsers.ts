"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

export default function useOnlineUsers() {
  const socket = useSocket();

  const [onlineUsers, setOnlineUsers] =
    useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "online-users",
      (data) => {
        if (Array.isArray(data)) {
          setOnlineUsers(data);
        } else {
          setOnlineUsers(
            data?.users || []
          );
        }
      }
    );

    return () => {
      socket.off("online-users");
    };
  }, [socket]);

  return onlineUsers;
}