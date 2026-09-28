import React, { useState } from 'react';
import axios from 'axios';
import { Lock, FileSpreadsheet, UploadCloud, LogOut, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [period, setPeriod] = useState('thismonth');
  const [textData, setTextData] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
    if (!textData.trim()) {
      alert("กรุณาวางข้อมูลก่อนกดบันทึก");
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    try {
      const blob = new Blob([textData], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', blob, `${period}.csv`);

      await axios.post(`${API_URL}/upload/${period}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('อัปเดตข้อมูลสำเร็จเรียบร้อยแล้ว!');
      setTextData('');
      
      // ลบข้อความสำเร็จหลังจาก 3 วินาที
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 font-sans">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
              <Lock size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 text-center mb-2">Admin Portal</h2>
          <p className="text-slate-500 text-sm text-center mb-8">กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบจัดการข้อมูล</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <input
                type="password"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-center font-bold tracking-widest text-lg"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {loginError && <p className="text-rose-500 text-xs mt-2 font-bold text-center">❌ รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
            Data Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">อัปเดตข้อมูลยอดขายและเป้าหมาย</p>
        </div>
        
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="flex items-center justify-center gap-2 text-sm text-rose-600 hover:text-white font-bold bg-rose-50 hover:bg-rose-500 px-5 py-2.5 rounded-xl transition-all border border-rose-100 hover:border-rose-500"
        >
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>
      
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
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">เลือกประเภทข้อมูล</label>
            <div className="relative">
              <select 
                className="appearance-none w-full md:w-72 p-3.5 pl-10 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-sm"
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="thismonth">📊 ยอดขายเดือนนี้ (This Month)</option>
                <option value="lastmonth">📉 ยอดขายเดือนที่แล้ว (Last Month)</option>
                <option value="lastyear">📅 ยอดขายปีที่แล้ว (Last Year)</option>
                <option value="target">🎯 ข้อมูลเป้าหมาย (Target)</option>
              </select>
              <FileSpreadsheet size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
        
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">วางข้อมูลจาก Excel</label>
          <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">คลุมดำตารางรวมหัวคอลัมน์แล้วกด Ctrl+V</span>
        </div>
        
        <textarea
          className="w-full h-72 p-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm mb-6 whitespace-pre outline-none transition-all resize-none shadow-inner bg-slate-50 focus:bg-white"
          placeholder="วางข้อมูลลงที่นี่..."
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
        ></textarea>
        
        <button
          onClick={handleUpload}
          disabled={loading || !textData.trim()}
          className={`w-full flex justify-center items-center gap-2 font-bold py-4 rounded-xl shadow-lg transition-all ${
            loading || !textData.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-1'
          }`}
        >
          <UploadCloud size={20} />
          {loading ? 'กำลังบันทึกและประมวลผล...' : 'อัปโหลดข้อมูลเข้าระบบ'}
        </button>
      </div>
    </div>
  );
}

export default Admin;