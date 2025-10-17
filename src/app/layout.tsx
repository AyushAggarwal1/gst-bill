import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GSTly",
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
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-D74FVBFXP5"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-D74FVBFXP5');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} h-full`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
