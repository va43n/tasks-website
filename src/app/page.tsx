"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      <p>Страница с заданиями</p>
    </div>
  );
}
