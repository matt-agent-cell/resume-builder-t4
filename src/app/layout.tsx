import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "AI-powered resume builder",
};

// viewport meta is set manually in <head> for viewport-fit=cover support

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          function setAppHeight() {
            document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
          }
          setAppHeight();
          window.addEventListener('resize', setAppHeight);
        `}} />
      </body>
    </html>
  );
}
