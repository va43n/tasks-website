"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push("auth/register")}>Регистрация</button>
      <button onClick={() => router.push("auth/login")}>Вход</button>
    </div>
  );
}
