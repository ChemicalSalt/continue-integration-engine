import React, { useEffect, useState } from 'react';

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <header className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-300">Continue Integration Engine</h1>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="px-4 py-2 border rounded-lg dark:border-gray-600 text-purple-800 dark:text-purple-300"
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
    </header>
  );
};

export default Header;
