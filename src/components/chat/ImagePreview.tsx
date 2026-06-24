"use client";

import { useState } from "react";

interface Props {
  imageUrl: string;
}

export default function ImagePreview({
  imageUrl,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <img
        src={imageUrl}
        alt="Chat Image"
        onClick={() =>
          setOpen(true)
        }
        className="rounded-lg max-w-sm mt-2 cursor-pointer hover:opacity-90"
      />

      {open && (
        <div
          onClick={() =>
            setOpen(false)
          }
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-6"
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="max-h-full max-w-full rounded-xl"
          />
        </div>
      )}
    </>
  );
}