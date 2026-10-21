"use client";

import { useEffect, useRef, useState } from "react";

const messages = {
  idle: "",
  copied: "Link copied to clipboard.",
  failed: "Could not copy the link. Try again.",
};

export const CopyLinkButton = ({ commentId }: { commentId: string }) => {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );
  const copyLink = async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    try {
      await navigator.clipboard.writeText(
        `${location.origin}${location.pathname}#comment-${commentId}`
      );
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("failed");
    }
  };
  return (
    <>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link to this comment"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring min-h-8 rounded-sm text-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {status === "copied" ? "Copied" : "Copy link"}
      </button>
      <output className="sr-only">{messages[status]}</output>
    </>
  );
};
