// src/components/auth/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL; // backend URL

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`${API}/auth/user`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.log("No user logged in");
      }
    };
    checkUser();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");

      setUser(data.user);
      setEmail("");
      setPassword("");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOAuthLogin = (provider) => {
    // Redirect to backend OAuth route
    window.location.href = `${API}/auth/${provider}`;
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-500">
      <motion.div
        key={isRegister}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 shadow-xl flex flex-col gap-6 transition-all duration-500"
      >
        <h2 className="text-2xl font-extrabold text-center text-zinc-900 dark:text-zinc-100">
          {user ? "Welcome" : isRegister ? "Register" : "Sign in"}
        </h2>

        {user ? (
          <div className="text-center space-y-4">
            <p className="text-lg text-zinc-700 dark:text-zinc-300">Logged in as:</p>
            <p className="text-yellow-500 font-mono">{user.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-400 text-white dark:text-black font-semibold shadow hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 outline-none transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 outline-none transition"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-400 text-white dark:text-black font-semibold shadow-lg hover:scale-[1.03] transition-transform"
            >
              {isRegister ? "Register" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="w-full py-3 rounded-full bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
            >
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin("github")}
              className="w-full py-3 rounded-full bg-black text-white font-semibold shadow hover:bg-gray-800 transition"
            >
              Sign in with GitHub
            </button>

            <p className="text-center text-sm mt-2 text-zinc-600 dark:text-zinc-400">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <span
                onClick={() => setIsRegister(!isRegister)}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                {isRegister ? "Sign in" : "Register"}
              </span>
            </p>

            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </form>
        )}
      </motion.div>
    </main>
  );
}
