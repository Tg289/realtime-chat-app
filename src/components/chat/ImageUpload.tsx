"use client";

import { UploadButton } from "@uploadthing/react";

type Props = {
  onUpload: (url: string) => void;
};

export default function ImageUpload({
  onUpload,
}: Props) {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res: any) => {
        if (res?.[0]) {
          onUpload(
            res[0].ufsUrl ??
              res[0].url
          );
        }
      }}
      onUploadError={(error) => {
        console.error(error);
      }}
    />
  );
}