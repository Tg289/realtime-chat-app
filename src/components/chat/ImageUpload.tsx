"use client";

import { useUploadThing } from "@/utils/uploadthing";

interface Props {
  onUpload: (url: string) => void;
}

export default function ImageUpload({
  onUpload,
}: Props) {
  const { startUpload } =
    useUploadThing(
      "imageUploader"
    );

  async function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const res =
      await startUpload([
        file,
      ]);

    if (res?.[0]) {
      onUpload(
        res[0].ufsUrl ??
          res[0].url
      );
    }
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={
        handleChange
      }
      className="text-sm"
    />
  );
}