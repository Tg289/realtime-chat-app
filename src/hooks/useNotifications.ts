"use client";

import { useEffect } from "react";

export default function useNotifications() {
  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    if (
      "Notification" in window &&
      Notification.permission ===
        "default"
    ) {
      Notification.requestPermission();
    }
  }, []);
}