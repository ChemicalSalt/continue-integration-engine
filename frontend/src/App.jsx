import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"; // NO BrowserRouter here
import Navbar from "./components/layout/navbar";
import Home from "./components/layout/home";
import Contact from "./components/layout/contact";
import Dashboard from "./components/dashboard/dashboard";
import Footer from "./components/layout/footer";
import Login from './components/auth/login';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem("darkMode");
    if (storedMode) setDarkMode(storedMode === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`flex flex-col min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-black text-zinc-200" : "bg-white text-zinc-900"
      }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact darkMode={darkMode} />} />
          <Route path="/dashboard/*" element={<Dashboard darkMode={darkMode} />} />
        </Routes>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;
