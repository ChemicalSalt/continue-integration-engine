import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";
import { FaYoutube, FaDiscord, FaInstagram } from "react-icons/fa";

export default function Navbar({ darkMode, setDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navItems = ["home", "dashboard", "contact"];
  const API = import.meta.env.VITE_API_URL;

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/auth/user`, {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <header className="relative z-50">
      {/* TOP BAR */}
      <div
        className={`flex items-center justify-between px-4 py-3 sm:py-4 transition-colors duration-300 ${
          darkMode
            ? "bg-black border-b border-purple-200/20 text-purple-300"
            : "bg-white border-b border-purple-600/20 text-purple-900"
        }`}
      >
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="sm:hidden transition hover:scale-110"
        >
          <Menu size={26} className={`${darkMode ? "text-purple-300" : "text-purple-700"}`} />
        </button>

        {/* Logo */}
        <div className="flex-1 text-center">
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-wide select-none truncate">
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r ${
                darkMode
                  ? "from-purple-300 via-purple-400 to-purple-500"
                  : "from-purple-600 via-purple-500 to-purple-700"
              }`}
            >
              CONTINUE INTEGRATION ENGINE
            </span>
          </h1>
        </div>

        {/* Right (Sign in / Profile) */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-semibold">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm sm:text-base font-semibold transition hover:opacity-80"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className={`text-sm sm:text-base font-semibold transition hover:opacity-80 ${
              darkMode ? "text-purple-300" : "text-purple-700"
            }`}
          >
            Sign in
          </Link>
        )}
      </div>

      {/* DESKTOP NAV */}
      <nav
        className={`hidden sm:flex justify-center gap-8 sm:gap-12 py-2 transition-colors duration-300 ${
          darkMode ? "bg-black text-purple-300" : "bg-white text-purple-900"
        }`}
      >
        {navItems.map((item) => {
          const isActive =
            (item === "home" && location.pathname === "/") ||
            location.pathname === `/${item}`;
          return (
            <Link
              key={item}
              to={item === "home" ? "/" : `/${item}`}
              className={`relative capitalize text-sm sm:text-md transition group ${
                isActive ? "text-purple-500 dark:text-purple-300 font-semibold" : ""
              }`}
            >
              {item}
            </Link>
          );
        })}
      </nav>

      {/* MOBILE SIDEBAR */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          ></div>

          <div
            className={`fixed top-0 left-0 w-64 h-full z-[9999] shadow-xl transform transition-transform duration-300 ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            } ${darkMode ? "bg-black text-purple-300" : "bg-white text-purple-900"} flex flex-col`}
          >
            {/* Sidebar Header */}
            <div className="flex justify-between items-center px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-bold">Menu</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="hover:scale-110 transition"
                >
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button onClick={() => setMenuOpen(false)} className="hover:scale-110 transition">
                  <X size={26} />
                </button>
              </div>
            </div>

            {/* Sidebar Links */}
            <div className="flex flex-col p-4 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item}
                  to={item === "home" ? "/" : `/${item}`}
                  onClick={() => setMenuOpen(false)}
                  className="capitalize text-lg hover:translate-x-2 transition-transform"
                >
                  {item}
                </Link>
              ))}

              
          
            </div>

            {/* Socials at the bottom */}
            <div className="flex flex-col items-center gap-4 p-4 border-t border-zinc-200 dark:border-zinc-700 mt-auto">
              <div className="flex gap-4">
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <FaYoutube className={`w-6 h-6 transition-colors duration-300 ${darkMode ? "text-purple-400 hover:text-red-400" : "text-purple-700 hover:text-red-600"}`} />
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                  <FaDiscord className={`w-6 h-6 transition-colors duration-300 ${darkMode ? "text-purple-400 hover:text-indigo-400" : "text-purple-700 hover:text-indigo-600"}`} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FaInstagram className={`w-6 h-6 transition-colors duration-300 ${darkMode ? "text-purple-400 hover:text-pink-400" : "text-purple-700 hover:text-pink-600"}`} />
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
