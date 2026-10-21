import type { ReactNode } from "react";

import { Navbar } from "@/components/navbar";

const MainLayout = ({ children }: { children: ReactNode }) => (
  <>
    <Navbar />
    {children}
  </>
);

export default MainLayout;
