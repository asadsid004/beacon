"use client";

import { Menu } from "@base-ui/react/menu";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { authClient } from "@/lib/auth-client";

export const UserMenu = ({ username }: { username: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const signOut = () => {
    startTransition(async () => {
      setError(null);
      try {
        const result = await authClient.signOut();
        if (result.error) {
          setError("Unable to sign out. Try again.");
          return;
        }
        queryClient.clear();
        router.replace("/");
        router.refresh();
      } catch {
        setError("Unable to sign out. Try again.");
      }
    });
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Open account menu for ${username}`}
        className="bg-secondary text-secondary-foreground hover:bg-accent focus-visible:ring-ring flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {username.slice(0, 1).toUpperCase()}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50">
          <Menu.Popup className="bg-popover text-popover-foreground max-w-64 min-w-40 rounded-lg border p-1 shadow-md outline-none">
            <p className="text-muted-foreground px-3 py-2 text-xs wrap-anywhere">
              {username}
            </p>
            <Menu.Item
              disabled={pending}
              closeOnClick={false}
              onClick={signOut}
              className="data-highlighted:bg-accent rounded-md px-3 py-2 text-sm outline-none data-disabled:opacity-50"
            >
              {pending ? "Signing out…" : "Sign out"}
            </Menu.Item>
            {error && (
              <p role="alert" className="text-destructive px-3 py-2 text-xs">
                {error}
              </p>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
