"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <body>
        <header>
          {user ? (
            <p>Добро пожаловать, {user.username}!</p>
          ) : (
            <div className="header-buttons">
              <button className="rounded-box button-form" onClick={() => router.push("/auth/register")}>Регистрация</button>
              <button className="rounded-box button-form" onClick={() => router.push("/auth/login")}>Вход</button>
            </div>
          )}
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
