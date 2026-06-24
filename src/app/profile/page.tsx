"use client";

import {
  useSession,
} from "next-auth/react";

import {
  useState,
} from "react";

import axios from "axios";

import ImageUpload from "@/components/chat/ImageUpload";

export default function ProfilePage() {
  const { data: session } =
    useSession();

  const [name, setName] =
    useState(
      session?.user?.name ||
        ""
    );

  const [image, setImage] =
    useState(
      session?.user
        ?.image || ""
    );

  async function saveProfile() {
    try {
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
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Profile
      </h1>

      {image && (
        <img
          src={image}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover mb-4"
        />
      )}

      <ImageUpload
        onUpload={setImage}
      />

      <input
        value={name}
        onChange={(e) =>
          setName(
            e.target.value
          )
        }
        className="w-full mt-4 bg-zinc-900 border border-zinc-700 rounded p-3"
      />

      <button
        onClick={
          saveProfile
        }
        className="mt-4 bg-indigo-600 px-5 py-3 rounded"
      >
        Save
      </button>
    </div>
  );
}