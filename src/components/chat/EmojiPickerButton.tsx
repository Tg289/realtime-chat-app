"use client";

import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

interface Props {
  onEmojiSelect: (
    emoji: string
  ) => void;
}

export default function EmojiPickerButton({
  onEmojiSelect,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="relative">
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="px-2 text-xl"
      >
        😀
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-50">
          <EmojiPicker
            onEmojiClick={(
              emojiData
            ) => {
              onEmojiSelect(
                emojiData.emoji
              );

              setOpen(
                false
              );
            }}
          />
        </div>
      )}
    </div>
  );
}