import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings } from 'lucide-react';

function Navbar() {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 transform scale-105" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:scale-105"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* โลโก้แบบไล่สี */}
        <div className="flex items-center gap-3 cursor-default">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center rounded-xl font-bold text-2xl shadow-lg shadow-indigo-500/30">
            S
          </div>
          <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight">
            Sales Dashboard
          </span>
        </div>
        
        <div className="flex gap-2 bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
          <NavLink to="/" className={navLinkClass}>
            <LayoutDashboard size={18} />
            รายวัน
          </NavLink>
          <NavLink to="/monthly" className={navLinkClass}>
            <Calendar size={18} />
            รายเดือน
          </NavLink>
          <NavLink to="/admin" className={navLinkClass}>
            <Settings size={18} />
            ตั้งค่า
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;