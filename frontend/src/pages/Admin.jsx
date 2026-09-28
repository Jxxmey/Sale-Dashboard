import React, { useState } from 'react';
import axios from 'axios';
import { Lock, FileSpreadsheet, UploadCloud, LogOut, CheckCircle, Target, Database, ChevronLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // 🌟 State ควบคุมการเปลี่ยนหน้า (menu, upload, kpi)
  const [activeTab, setActiveTab] = useState('menu');

  // State สำหรับหน้า Upload
  const [period, setPeriod] = useState('thismonth');
  const [textData, setTextData] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // State สำหรับหน้า KPI
  const [kpiCover, setKpiCover] = useState(localStorage.getItem('kpiCover') || 25);
  const [kpiUfund, setKpiUfund] = useState(localStorage.getItem('kpiUfund') || 20);
  const [kpiSuccess, setKpiSuccess] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Comseven') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleUpload = async () => {
    if (!textData.trim()) { alert("กรุณาวางข้อมูลก่อนกดบันทึก"); return; }
    setLoading(true); setSuccessMsg('');
    try {
      const blob = new Blob([textData], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', blob, `${period}.csv`);
      await axios.post(`${API_URL}/upload/${period}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccessMsg('อัปเดตข้อมูลสำเร็จเรียบร้อยแล้ว!');
      setTextData('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) { alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล'); }
    setLoading(false);
  };

  const handleSaveKPI = () => {
    localStorage.setItem('kpiCover', kpiCover);
    localStorage.setItem('kpiUfund', kpiUfund);
    setKpiSuccess(true);
    setTimeout(() => setKpiSuccess(false), 3000);
  };

  // 🔒 หน้าจอล็อกอิน
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 font-sans">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shadow-inner"><Lock size={32} /></div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">Admin Portal</h2>
          <p className="text-slate-500 text-sm text-center mb-8">กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบจัดการข้อมูล</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-center font-bold tracking-widest text-lg"
              />
              {loginError && <p className="text-rose-500 text-xs mt-2 font-bold text-center">❌ รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง</p>}
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10 font-sans">
      
      {/* ส่วนหัวของหน้า Admin */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">System Admin</h1>
          <p className="text-slate-500 text-sm mt-1">ศูนย์กลางจัดการข้อมูลและตั้งค่าระบบ</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="flex items-center justify-center gap-2 text-sm text-rose-600 hover:text-white font-bold bg-rose-50 hover:bg-rose-500 px-5 py-2.5 rounded-xl transition-all border border-rose-100 hover:border-rose-500 shadow-sm">
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>

      {/* ==================================================== */}
      {/* 📌 1. หน้าต่างเมนูหลัก (แสดงผลเมื่อ activeTab === 'menu') */}
      {/* ==================================================== */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* เมนูที่ 1: อัปโหลดข้อมูล */}
          <div 
            onClick={() => setActiveTab('upload')} 
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-300 cursor-pointer transition-all duration-300 group flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
              <Database size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">อัปโหลดข้อมูลยอดขาย</h2>
            <p className="text-slate-500 font-medium">เพิ่มหรืออัปเดตข้อมูลยอดขายเดือนนี้, เดือนที่แล้ว, ปีที่แล้ว และไฟล์เป้าหมาย (Target) จาก Excel</p>
            <div className="mt-6 px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              เข้าสู่ระบบเพิ่มข้อมูล
            </div>
          </div>

          {/* เมนูที่ 2: ตั้งค่า KPI */}
          <div 
            onClick={() => setActiveTab('kpi')} 
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-rose-300 cursor-pointer transition-all duration-300 group flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner">
              <Target size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-rose-600 transition-colors">ตั้งค่าเป้าหมาย (KPI)</h2>
            <p className="text-slate-500 font-medium">กำหนดเปอร์เซ็นต์ขั้นต่ำสำหรับการขายพ่วง (Attach Rate) เช่น Cover+ และ UFUND เพื่อใช้เตือนในหน้ารายงาน</p>
            <div className="mt-6 px-6 py-2.5 bg-rose-50 text-rose-700 font-bold rounded-full group-hover:bg-rose-600 group-hover:text-white transition-colors">
              จัดการเป้าหมาย
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* 📤 2. หน้าต่างอัปโหลดข้อมูล (แสดงผลเมื่อ activeTab === 'upload') */}
      {/* ==================================================== */}
      {activeTab === 'upload' && (
        <div className="animate-in slide-in-from-right-8 duration-300">
          <button onClick={() => setActiveTab('menu')} className="flex items-center gap-1 text-slate-500 font-bold hover:text-indigo-600 mb-6 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 w-fit">
            <ChevronLeft size={20} /> กลับไปหน้าเมนู
          </button>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-lg border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-pulse">
                <CheckCircle size={20} className="text-emerald-500" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4 relative z-10">
              <div>
                <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Database size={24} className="text-indigo-600" /> นำเข้าข้อมูลระบบ (Upload Data)
                </h2>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">เลือกประเภทข้อมูลที่ต้องการอัปเดต</label>
                <div className="relative">
                  <select value={period} onChange={(e) => setPeriod(e.target.value)} className="appearance-none w-full md:w-72 p-3.5 pl-10 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-sm">
                    <option value="thismonth">📊 ยอดขายเดือนนี้ (This Month)</option>
                    <option value="lastmonth">📉 ยอดขายเดือนที่แล้ว (Last Month)</option>
                    <option value="lastyear">📅 ยอดขายปีที่แล้ว (Last Year)</option>
                    <option value="target">🎯 ข้อมูลเป้าหมาย (Target)</option>
                  </select>
                  <FileSpreadsheet size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
            
            <div className="mb-2 flex items-center justify-between mt-4">
              <label className="text-sm font-bold text-slate-700">วางข้อมูลจาก Excel</label>
              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">คลุมดำตารางรวมหัวคอลัมน์แล้วกด Ctrl+V</span>
            </div>
            
            <textarea placeholder="วางข้อมูลลงที่นี่..." value={textData} onChange={(e) => setTextData(e.target.value)}
              className="w-full h-72 p-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm mb-6 whitespace-pre outline-none transition-all resize-none shadow-inner bg-slate-50 focus:bg-white"
            ></textarea>
            
            <button onClick={handleUpload} disabled={loading || !textData.trim()}
              className={`w-full flex justify-center items-center gap-2 font-bold py-4 rounded-xl shadow-lg transition-all ${
                loading || !textData.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-1'
              }`}
            >
              <UploadCloud size={20} /> {loading ? 'กำลังบันทึกและประมวลผล...' : 'อัปโหลดข้อมูลเข้าระบบ'}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 🎯 3. หน้าต่างตั้งค่า KPI (แสดงผลเมื่อ activeTab === 'kpi') */}
      {/* ==================================================== */}
      {activeTab === 'kpi' && (
        <div className="animate-in slide-in-from-right-8 duration-300 max-w-2xl mx-auto">
          <button onClick={() => setActiveTab('menu')} className="flex items-center gap-1 text-slate-500 font-bold hover:text-rose-600 mb-6 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 w-fit">
            <ChevronLeft size={20} /> กลับไปหน้าเมนู
          </button>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-lg border border-slate-100 relative overflow-hidden">
            <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
              <Target size={24} className="text-rose-500"/> ตั้งค่าเป้าหมายการขายพ่วง (Attach Rate)
            </h2>
            <p className="text-sm text-slate-500 mb-6">เปอร์เซ็นต์นี้จะถูกนำไปใช้ประมวลผลการแจ้งเตือนในหน้า Manager's Focus Board และแถบสีเขียว/แดงในตารางรายวัน</p>
            
            <div className="flex flex-col gap-5 mb-8">
               <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex justify-between items-center">
                 <div>
                   <label className="text-base font-black text-amber-800 block">เป้าหมายแนบ Cover+ (%)</label>
                   <p className="text-xs text-amber-600 mt-1 font-medium">คำนวณเทียบจากจำนวนเครื่อง iPhone</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="number" value={kpiCover} onChange={(e) => setKpiCover(e.target.value)} className="w-24 p-3 text-xl font-black text-amber-700 bg-white rounded-xl border border-amber-200 shadow-inner outline-none focus:ring-2 focus:ring-amber-400 text-center" />
                   <span className="font-bold text-amber-600">%</span>
                 </div>
               </div>
               
               <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex justify-between items-center">
                 <div>
                   <label className="text-base font-black text-rose-800 block">เป้าหมายแนบ UFUND (%)</label>
                   <p className="text-xs text-rose-600 mt-1 font-medium">คำนวณเทียบจากจำนวนเครื่อง iPhone</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="number" value={kpiUfund} onChange={(e) => setKpiUfund(e.target.value)} className="w-24 p-3 text-xl font-black text-rose-700 bg-white rounded-xl border border-rose-200 shadow-inner outline-none focus:ring-2 focus:ring-rose-400 text-center" />
                   <span className="font-bold text-rose-600">%</span>
                 </div>
               </div>
            </div>
            
            <button onClick={handleSaveKPI} className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 hover:-translate-y-0.5 shadow-lg transition-all flex items-center justify-center gap-2 text-lg">
              {kpiSuccess ? <><CheckCircle size={20} className="text-emerald-400"/> บันทึกสำเร็จ</> : 'บันทึกเป้าหมาย KPI'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;