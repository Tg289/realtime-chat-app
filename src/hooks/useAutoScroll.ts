"use client";

import { useEffect, RefObject } from "react";

export default function useAutoScroll(
  ref: RefObject<HTMLDivElement | null>,
  dependency: unknown
) {
  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [dependency]);
}