import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 hidden md:block">
      <h1 className="text-xl font-bold mb-6">Workspace</h1>
      <nav className="flex flex-col gap-2">
        <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>
        <Link to="/contact" className="hover:text-blue-500">Contact</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
