"use client";

import { useRouter } from "next/navigation";
import "../../styles/start_page.css";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="centered-container-start">
      <h1>Страница с заданиями</h1>
    </div>
  );
}
