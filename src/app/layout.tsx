import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GST Bill Maker",
  description: "Create and manage GST bills with professional invoicing",
  icons: {
    icon: [
      {
        url: '/favicon.svg?v=2',
        type: 'image/svg+xml',
        sizes: '32x32',
      },
      {
        url: '/favicon-16x16.svg?v=2',
        type: 'image/svg+xml',
        sizes: '16x16',
      }
    ],
    shortcut: '/favicon.svg?v=2',
    apple: '/favicon.svg?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.svg?v=2" type="image/svg+xml" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
      </head>
      <body className={`${inter.className} h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
