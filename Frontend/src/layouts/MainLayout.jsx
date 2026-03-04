import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linksByRole = {
  student: [
    { name: 'Dashboard', to: '/student/dashboard' },
    { name: 'Upload', to: '/student/upload' },
    { name: 'Companies', to: '/student/companies' },
    { name: 'Result', to: '/student/result' },
    { name: 'Roadmap', to: '/student/roadmap' },
  ],
  admin: [
    { name: 'Dashboard', to: '/admin/dashboard' },
    { name: 'Add Company', to: '/admin/add-company' },
    { name: 'Companies', to: '/admin/companies' },
    { name: 'Analytics', to: '/admin/analytics' },
  ],
};

const MainLayout = ({ children }) => {
  const { role, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = linksByRole[role] || [];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform transform bg-white border-r lg:static lg:inset-auto lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/" className="text-xl font-semibold">
            SmartPlacement
          </Link>
          <button
            className="lg:hidden text-gray-600 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md mb-1 text-gray-700 hover:bg-gray-200 ${
                  isActive ? 'bg-gray-200 font-medium' : ''
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* navbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
          <button
            className="text-gray-600 lg:hidden focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{role?.toUpperCase()}</span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
