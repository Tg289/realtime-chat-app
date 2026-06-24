"use client";

import axios from "axios";

export default function CreateChatButton() {
  async function createRoom() {
    try {
      const response = await axios.post(
        "/api/rooms",
        {
          name: "My First Chat Room",
          isGroup: false,
          memberIds: [],
        }
      );

      console.log(response.data);

      alert("Room Created Successfully");

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert("Failed to create room");
    }
  }

  return (
    <button
      onClick={createRoom}
      className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2"
    >
      + Create Chat
    </button>
  );
}