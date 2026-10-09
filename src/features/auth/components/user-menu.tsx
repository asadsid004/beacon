"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Open account menu for ${username}`}
        render={<Button variant="secondary" size="icon" />}
      >
        {username.slice(0, 1).toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-48 max-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="wrap-anywhere">
            {username}
          </DropdownMenuLabel>
          <DropdownMenuItem
            disabled={pending}
            closeOnClick={false}
            onClick={signOut}
          >
            {pending ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {error && (
          <p role="alert" className="text-destructive px-1.5 py-1 text-xs">
            {error}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
