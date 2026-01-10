import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. 导入 Script 组件
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hub Select ",
  description: "软件学院开源资源共享平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}

      {/* 2. 在 body 结束前注入脚本 */}
        <Script
          id="live-preview"
          src="https://tweakcn.com/live-preview.min.js"
          strategy="afterInteractive" // 在页面交互后加载，不影响首屏速度
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
