"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import "../../styles/globals.css";

type User = {
  username: string;
};

export default function Layout ({
  children
}: {children: React.ReactNode}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
    .then((res) => res.json())
    .then((data) => setUser(data.user));
  }, []);

  return (
    <html lang="ru">
      <head>
        <title>Сайт с заданиями</title>
      </head>
      <body>
        <header>
          <div className="header-buttons-container">
            <button className="header-button" onClick={() => router.push("/")}>Главное меню</button>
          </div>
          {user ? (
            <p>Добро пожаловать, {user.username}!</p>
          ) : (
            <div className="header-buttons-container">
              <button className="header-button" onClick={() => router.push("/auth/register")}>Регистрация</button>
              <button className="header-button" onClick={() => router.push("/auth/login")}>Вход</button>
            </div>
          )}
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
