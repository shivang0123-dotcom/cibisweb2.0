import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CibisWeb",
  description: "CibisWeb 2.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
