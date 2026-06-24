"use client";

import { useState } from "react";
import axios from "axios";

type Member = {
  id: string;

  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function GroupSettings({
  roomId,
  members,
}: {
  roomId: string;
  members: Member[];
}) {
  const [email, setEmail] =
    useState("");

  async function addMember() {
    try {
      await axios.post(
        "/api/chat/add-member",
        {
          roomId,
          email,
        }
      );

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  async function removeMember(
    userId: string
  ) {
    try {
      await axios.post(
        "/api/chat/remove-member",
        {
          roomId,
          userId,
        }
      );

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4">
      <h2 className="font-semibold mb-4">
        Group Settings
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          placeholder="User Email"
          className="flex-1 bg-zinc-800 rounded-lg px-4 py-2"
        />

        <button
          onClick={addMember}
          className="bg-indigo-600 px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {members.map(
          (member) => (
            <div
              key={member.id}
              className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg"
            >
              <div>
                <p>
                  {
                    member.user
                      .name
                  }
                </p>

                <p className="text-xs text-zinc-500">
                  {
                    member.user
                      .email
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  removeMember(
                    member.user.id
                  )
                }
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}