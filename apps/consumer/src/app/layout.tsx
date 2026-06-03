import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Setu SHG Platform | Empowering Self-Help Groups",
  description: "A comprehensive platform for skill development, grant acquisition, and global expansion for SHGs.",
};

import DemoSwitcher from "@/components/DemoSwitcher";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-[#fafaf9] text-foreground relative">
        <DemoSwitcher />
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
