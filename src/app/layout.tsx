"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import "../../styles/globals.css";

type User = {
  username: string;
  role: string;
};

export default function Layout ({
  children
}: {children: React.ReactNode}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("api/auth/logout", {method: "POST"});
    setUser(null);
  }

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
            <>
              {user.role === "Доктор" && (
                <div className="header-buttons-container">
                  <button className="header-button" onClick={() => router.push(`/profile/${user.username}`)}>Профиль</button>
                  <button className="header-button" onClick={() => router.push(`/profile/${user.username}/edit`)}>Редактирование профиля</button>
                </div>
              )}
              <div className="header-buttons-container">
                <p>Добро пожаловать, {user.role} {user.username}!</p>
                <button className="header-button" onClick={handleLogout}>Выход</button>
              </div>
            </>
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
