"use client";

import { Image03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

export const PostImage = ({ src }: { src: string }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="bg-muted mb-8 aspect-video overflow-hidden rounded-lg md:aspect-21/9">
      {failed ? (
        <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3">
          <HugeiconsIcon icon={Image03Icon} size={32} aria-hidden="true" />
          <span className="text-sm">Image unavailable</span>
        </div>
      ) : (
        <img
          ref={(image) => {
            if (image?.complete && image.naturalWidth === 0) {
              setFailed(true);
            }
          }}
          src={src}
          alt=""
          fetchPriority="high"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      )}
    </div>
  );
};
