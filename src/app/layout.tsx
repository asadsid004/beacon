import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Beacon",
    template: "%s | Beacon",
  },
  description: "A link and text post discussion platform.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    lang="en"
    className={cn(
      "h-full",
      "antialiased",
      dmSans.variable,
      inter.variable,
      geistMono.variable
    )}
  >
    <body className="flex min-h-full flex-col font-sans">{children}</body>
  </html>
);

export default RootLayout;
