import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings, Target, Star, BarChart3 } from 'lucide-react';

function Navbar() {
  const desktopLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all duration-300 text-sm ${
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:scale-105"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
      isActive 
        ? "text-indigo-600" 
        : "text-slate-400 hover:text-slate-600"
    }`;

  return (
    <>
      {/* 💻 Desktop */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-[90rem] mx-auto px-6 h-16 w-full flex items-center justify-between">
          
          {/* 🌟 เปลี่ยนเป็น Logo.png */}
          <div className="flex items-center gap-3 cursor-default">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-lg bg-white shadow-sm border border-slate-100"
            />
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight hidden lg:block">
              Sales Dashboard
            </span>
          </div>
          
          <div className="flex gap-1 bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
            <NavLink to="/" className={desktopLinkClass}><LayoutDashboard size={16} /> รายวัน</NavLink>
            <NavLink to="/monthly" className={desktopLinkClass}><Calendar size={16} /> รายเดือน</NavLink>
            <NavLink to="/calculator" className={desktopLinkClass}><Target size={16} /> จำลองเป้า</NavLink>
            <NavLink to="/performance" className={desktopLinkClass}><Star size={16} /> PC</NavLink>
            <NavLink to="/report" className={desktopLinkClass}><BarChart3 size={16} /> Report</NavLink>
            <NavLink to="/admin" className={desktopLinkClass}><Settings size={16} /> ตั้งค่า</NavLink>
          </div>
        </div>
      </nav>

      {/* 📱 Mobile */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-center shadow-sm">
         <div className="flex items-center gap-2">
            {/* 🌟 เปลี่ยนเป็น Logo.png */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-9 h-9 object-contain rounded-lg bg-white shadow-sm border border-slate-100"
            />
            <span className="font-bold text-lg text-slate-800">Sales Dashboard</span>
         </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-16 px-1">
          <NavLink to="/" className={mobileLinkClass}>
            {({ isActive }) => (<><LayoutDashboard size={20} /><span className={`text-[8px] sm:text-[9px] ${isActive ? "font-bold" : "font-medium"}`}>รายวัน</span></>)}
          </NavLink>
          <NavLink to="/monthly" className={mobileLinkClass}>
            {({ isActive }) => (<><Calendar size={20} /><span className={`text-[8px] sm:text-[9px] ${isActive ? "font-bold" : "font-medium"}`}>รายเดือน</span></>)}
          </NavLink>
          <NavLink to="/calculator" className={mobileLinkClass}>
            {({ isActive }) => (<><Target size={20} /><span className={`text-[8px] sm:text-[9px] ${isActive ? "font-bold" : "font-medium"}`}>จำลองเป้า</span></>)}
          </NavLink>
          <NavLink to="/performance" className={mobileLinkClass}>
            {({ isActive }) => (<><Star size={20} /><span className={`text-[8px] sm:text-[9px] ${isActive ? "font-bold" : "font-medium"}`}>PC</span></>)}
          </NavLink>
          <NavLink to="/report" className={mobileLinkClass}>
            {({ isActive }) => (<><BarChart3 size={20} /><span className={`text-[8px] sm:text-[9px] ${isActive ? "font-bold" : "font-medium"}`}>Report</span></>)}
          </NavLink>
          <NavLink to="/admin" className={mobileLinkClass}>
            {({ isActive }) => (<><Settings size={20} /><span className={`text-[8px] sm:text-[9px] ${isActive ? "font-bold" : "font-medium"}`}>ตั้งค่า</span></>)}
          </NavLink>
        </div>
      </nav>
    </>
  );
}

export default Navbar;