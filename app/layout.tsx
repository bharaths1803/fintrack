import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinTrack - A Personal Financial Tracking Application",
  description:
    "Your one-shot personal finance tracker, helping you to keep track of expenses, income sources, analyse it, and get budget insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            {children}
            {/* Footer */}
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
