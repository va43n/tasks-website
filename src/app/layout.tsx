"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {method: "POST"});
    setUser(null);
    router.push("/");
  }

  const handleSearch = ()  => {
    if (!searchQuery.trim()) return;
    router.push(`/profile/${searchQuery}`);
    setSearchQuery("");
  }

  return (
    <html lang="ru">
      <head>
        <title>Сайт с заданиями</title>
      </head>
      <body>
        <header>
          <div className="header-buttons-container">
            <button className="header-button" onClick={() => router.push("/")}>
               <Image alt="Меню" src="/icons/home.svg" width={16} height={16} />
            </button>
          </div>

          <div className="menu-container">
            <button className="header-button menu-opener" onClick={toggleMenu}>
              <Image alt="Бургер" src="/icons/burger.svg" width={16} height={16} />
            </button>

            {isMenuOpen && (
              <>
                {user ? (
                  <div className="menu-content">
                    {user.role === "Доктор" ? (
                      <>
                        <button className="header-button" onClick={() => {
                          setIsMenuOpen(false);
                          router.push(`/profile/${user.username}`);
                        }}>Профиль</button>
                        <button className="header-button" onClick={() => {
                          setIsMenuOpen(false);
                          router.push(`/profile/${user.username}/edit`);
                        }}>Редактирование</button>
                        <button className="header-button" onClick={() => {
                          setIsMenuOpen(false);
                          router.push(`/profile/${user.username}/activities`);
                        }}>Активности</button>
                      </>
                    ) : (
                      <>
                        <input type="text" className="header-search-input header-search-input-width" placeholder="Поиск профиля" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => {
                          if (e.key === "Enter") {handleSearch(); setIsMenuOpen(false);}
                        }} />
                        <button className="header-button" onClick={() => {
                          setIsMenuOpen(false);
                          router.push(`/patient-files/${user.username}`);
                        }}>Мои файлы</button>
                      </>
                    )}
                    <button className="header-button-logout" onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}>Выйти</button>
                  </div>
                ) : (
                  <div className="menu-content">
                    <button className="header-button" onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/auth/register");
                    }}>Регистрация</button>
                    <button className="header-button" onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/auth/login");
                    }}>Вход</button>
                  </div>
                )}
              </>
            )}
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
