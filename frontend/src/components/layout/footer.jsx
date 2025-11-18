import { FaYoutube, FaInstagram, FaDiscord } from "react-icons/fa";

export default function Footer({ darkMode }) {
  return (
    <footer
      className={`w-full py-8 px-6 mt-auto border-t transition-colors duration-300 ${
        darkMode
          ? "bg-black border-zinc-700 text-purple-300"
          : "bg-white border-zinc-300 text-purple-900"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-5 text-center">
        <div className="flex gap-6">
          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <FaYoutube
              className={`w-7 h-7 transition-colors duration-300 ${
                darkMode ? "text-purple-400 hover:text-red-400" : "text-purple-700 hover:text-red-600"
              }`}
            />
          </a>

          {/* Discord */}
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <FaDiscord
              className={`w-7 h-7 transition-colors duration-300 ${
                darkMode ? "text-purple-400 hover:text-indigo-400" : "text-purple-700 hover:text-indigo-600"
              }`}
            />
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <FaInstagram
              className={`w-7 h-7 transition-colors duration-300 ${
                darkMode ? "text-purple-400 hover:text-pink-400" : "text-purple-700 hover:text-pink-600"
              }`}
            />
          </a>
        </div>

        {/* Copyright */}
        <p className={`text-sm transition-colors duration-300 ${darkMode ? "text-purple-400" : "text-purple-600"}`}>
          © 2025 Continue Integration Engine. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
