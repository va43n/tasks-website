"use client";

/* import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
}); */

/* export const metadata: Metadata = {
  title: "Tasks",
  description: "Website for downloading tasks",
}; */

/* export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
} */

export default function Layout ({
  children
}: {children: React.ReactNode}) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
    .then((res) => res.json())
    .then((data) => setUser(data.user));
  }, []);

  return (
    <html lang="ru">
      <body>
        <header>
          {user ? (
            <p>Добро пожаловать, {user.username}!</p>
          ) : (
            <div>
              <button onClick={() => router.push("/auth/register")}>Регистрация</button>
              <button onClick={() => router.push("/auth/login")}>Вход</button>
            </div>
          )}
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
