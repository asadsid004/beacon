import type { ReactNode } from "react";

import { AuthShowcasePanel } from "@/features/auth/components/auth-showcase-panel";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <main className="bg-background text-foreground flex min-h-[calc(100dvh-3.5rem)] w-full lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden">
    <div className="flex flex-1 flex-col justify-between p-6">{children}</div>
    <div className="hidden p-4 lg:flex lg:h-full lg:w-1/2 lg:overflow-hidden">
      <AuthShowcasePanel />
    </div>
  </main>
);

export default AuthLayout;
