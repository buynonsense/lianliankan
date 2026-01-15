import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import ToastContainer from "@/components/Notification/ToastContainer";
import Navbar from "@/components/Navigation/Navbar";
import PageTransition from "@/components/Navigation/PageTransition";

export const metadata: Metadata = {
  title: "连连看游戏",
  description: "基于Next.js的连连看游戏，支持用户系统、积分和排行榜",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
