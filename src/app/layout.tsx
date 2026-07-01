import type { Metadata } from "next";
import { Bitter, Libre_Franklin } from "next/font/google";
import "./globals.css";
import { TouchActive } from "@/components/touch-active";

const libreFranklin = Libre_Franklin({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bitter = Bitter({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.circolodelbridge.com"),
  title: "Circolo Del Bridge | Italian Cuisine",
  description: "Mobile-first Italian restaurant menu, ordering, and staff dashboard.",
  applicationName: "Circolo Del Bridge",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Circolo Del Bridge",
  },
  // favicon.ico, icon.png, and apple-icon.png in src/app/ are picked up
  // automatically by Next.js App Router file convention with correct hashed URLs.
  // Do not declare them manually here — it causes URL mismatches on CDN edges.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreFranklin.variable} ${bitter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TouchActive />
        {children}
      </body>
    </html>
  );
}
