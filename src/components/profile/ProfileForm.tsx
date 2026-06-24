"use client";

import { useState } from "react";
import axios from "axios";

import ImageUpload from "@/components/chat/ImageUpload";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export default function ProfileForm({
  user,
}: {
  user: User;
}) {
  const [name, setName] =
    useState(user.name);

  const [image, setImage] =
    useState(user.image ?? "");

  const [loading, setLoading] =
    useState(false);

  async function handleSave() {
    try {
      setLoading(true);

      await axios.patch(
        "/api/profile",
        {
          name,
          image,
        }
      );

      alert(
        "Profile Updated"
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-6">
      <div className="space-y-6">
        {/* Avatar */}

        <div>
          <label className="block mb-2">
            Avatar
          </label>

          <ImageUpload
            onUpload={setImage}
          />

          {image && (
            <img
              src={image}
              alt="Avatar"
              className="w-24 h-24 rounded-full mt-4 object-cover border border-zinc-700"
            />
          )}
        </div>

        {/* Name */}

        <div>
          <label className="block mb-2">
            Name
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3"
          />
        </div>

        {/* Email */}

        <div>
          <label className="block mb-2">
            Email
          </label>

          <input
            disabled
            value={user.email}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 opacity-60"
          />
        </div>

        {/* Save */}

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg"
        >
          {loading
            ? "Saving..."
            : "Save Profile"}
        </button>
      </div>
    </div>
  );
}