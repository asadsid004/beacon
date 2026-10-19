"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { z } from "zod";

export const CommentAnchorFocus = ({
  id,
  postId,
}: {
  id?: string;
  postId: string;
}) => {
  const router = useRouter();
  useEffect(() => {
    const hashId = z
      .uuid()
      .safeParse(window.location.hash.replace(/^#comment-/u, "")).data;
    if (!hashId || (id && hashId !== id)) {
      return;
    }
    const comment = document.querySelector<HTMLElement>(`#comment-${hashId}`);
    if (
      !comment &&
      new URLSearchParams(window.location.search).get("comment") !== hashId
    ) {
      // oxlint-disable-next-line react-doctor/nextjs-no-client-side-redirect -- URL fragments never reach the server; off-page comment anchors must resolve after hydration.
      router.replace(`/p/${postId}?comment=${hashId}#comment-${hashId}`);
      return;
    }
    comment?.focus({ preventScroll: true });
    comment?.scrollIntoView({ block: "start" });
  }, [id, postId, router]);
  return null;
};
