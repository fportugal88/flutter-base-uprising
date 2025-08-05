import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, FileText } from 'lucide-react';

const navItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Assistente', url: '/data-assistant', icon: BarChart3 },
  { title: 'Solicitações', url: '/my-requests', icon: FileText },
];

export function BottomNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                isActive
                  ? 'text-uber-blue'
                  : 'text-gray-600'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}