'use client';

import "./globals.css";
import { AuthProvider } from "context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider >
      <html lang="en">
        <link rel="icon" href="/favicon.ico" />
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
}
