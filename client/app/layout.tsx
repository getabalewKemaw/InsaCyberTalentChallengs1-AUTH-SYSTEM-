import type { Metadata } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncWrite - Real-Time Collaborative Editor",
  description: "Create, edit, and collaborate on documents in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jost.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FBF9F6] text-[#63594D] font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
