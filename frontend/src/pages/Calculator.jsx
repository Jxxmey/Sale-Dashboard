import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Calendar as CalendarIcon, User, Zap, CheckCircle2, Edit3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Calculator() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  
  // 🌟 เก็บ state เปอร์เซ็นต์เป้าหมาย แยกอิสระตามแต่ละหมวดหมู่ (เริ่มต้นที่ 105%)
  const [targetPercents, setTargetPercents] = useState({
    Total: 105,
    Mac: 105,
    iPad: 105,
    iPhone: 105,
    AppleWatch: 105,
    ABA: 105,
    '3RD': 105,
    Sim: 105
  });
  
  const today = new Date();
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const [passedDays, setPassedDays] = useState(today.getDate());
  const [totalDays, setTotalDays] = useState(daysInCurrentMonth);

  useEffect(() => {
    fetchMonthlySummary();
  }, []);

  const fetchMonthlySummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/summary/thismonth`);
      const sorted = res.data.sort((a, b) => String(a.OfficerID).localeCompare(String(b.OfficerID)));
      setData(sorted);
      if (sorted.length > 0) setSelectedOfficerId(sorted[0].OfficerID); 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const formatMoney = (num) => {
    const val = Number(num);
    return val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0';
  };

  const calculateActual = (officer) => {
    if (!officer) return 0;
    return (officer.Mac || 0) + (officer.iPad || 0) + (officer.iPhone || 0) + 
           (officer['Apple Watch'] || 0) + (officer.ABA || 0) + (officer['3RD'] || 0) + (officer.PVL || 0);
  };

  const officer = data.find(o => o.OfficerID === selectedOfficerId);
  const remainingDays = totalDays - passedDays;

  const categories = [
    { key: 'Total', label: '🏆 สรุปยอดรวม (Total)', targetKey: 'Target_Total', isTotal: true },
    { key: 'Mac', label: '🍎 Mac', targetKey: 'Target_Mac', actualKey: 'Mac' },
    { key: 'iPad', label: '🍎 iPad', targetKey: 'Target_iPad', actualKey: 'iPad' },
    { key: 'iPhone', label: '🍎 iPhone', targetKey: 'Target_iPhone', actualKey: 'iPhone' },
    { key: 'AppleWatch', label: '⌚ Apple Watch', targetKey: 'Target_AppleWatch', actualKey: 'Apple Watch' },
    { key: 'ABA', label: '🎧 ABA', targetKey: 'Target_ABA', actualKey: 'ABA' },
    { key: '3RD', label: '🎧 3RD', targetKey: 'Target_3RD', actualKey: '3RD' },
    { key: 'Sim', label: '📱 SIM', targetKey: 'Target_Sim', actualKey: 'Sim' }
  ];

  // Component สำหรับแสดงผลการ์ดแต่ละหมวดหมู่
  const SimCard = ({ cat }) => {
    if (!officer) return null;

    const baseTarget = cat.isTotal ? (officer.Target_Total || 0) : (officer[cat.targetKey] || 0);
    const actual = cat.isTotal ? calculateActual(officer) : (officer[cat.actualKey] || 0);
    
    // ดึงค่าเปอร์เซ็นต์ที่ผู้ใช้พิมพ์ในช่องของหมวดหมู่นี้มาคำนวณ
    const numericPercent = Number(targetPercents[cat.key]) || 0;
    const newTarget = baseTarget * (numericPercent / 100);
    
    const diff = newTarget - actual;
    const dailyRequired = diff > 0 && remainingDays > 0 ? diff / remainingDays : 0;
    const currentPercent = baseTarget > 0 ? (actual / baseTarget) * 100 : 0;

    const isDark = cat.isTotal;

    return (
      <div className={`p-4 sm:p-5 rounded-3xl shadow-sm border flex flex-col transition-all duration-300 ${isDark ? 'bg-slate-900 border-slate-700 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:shadow-md'}`}>
        
        {/* หัวการ์ด */}
        <div className="flex justify-between items-center border-b pb-3 mb-3 border-slate-200/20">
          <h3 className={`font-black tracking-wide ${isDark ? 'text-white text-lg' : 'text-slate-700'}`}>{cat.label}</h3>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${currentPercent >= 100 ? 'bg-emerald-100 text-emerald-700' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
            Act: {currentPercent.toFixed(1)}%
          </span>
        </div>

        {/* 🌟 กล่องสำหรับ "พิมพ์" ปรับเป้าหมายเปอร์เซ็นต์ */}
        <div className={`p-3 rounded-xl mb-3 flex justify-between items-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50/50 border-indigo-100'}`}>
          <div>
            <p className={`text-[10px] uppercase font-bold mb-1.5 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-indigo-800'}`}>
              <Edit3 size={12} /> พิมพ์เป้าหมาย (%)
            </p>
            <div className="flex items-center gap-1.5">
              <input 
                type="number"
                className={`w-16 p-1 text-center text-sm font-black rounded-lg outline-none focus:ring-2 ${isDark ? 'bg-slate-700 text-white border-none focus:ring-indigo-500' : 'bg-white text-indigo-700 border border-indigo-200 focus:ring-indigo-400 shadow-inner'}`}
                value={targetPercents[cat.key]}
                onChange={(e) => setTargetPercents({ ...targetPercents, [cat.key]: e.target.value })}
              />
              <span className={`text-sm font-black ${isDark ? 'text-slate-500' : 'text-indigo-400'}`}>%</span>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-[10px] font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>เป้าเดิม: {formatMoney(baseTarget)}</p>
            <p className={`text-xl font-black ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{formatMoney(newTarget)}</p>
          </div>
        </div>

        {/* ยอด Actual */}
        <div className="flex justify-between items-center px-1 mb-3">
          <span className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Actual (ยอดจริง)</span>
          <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatMoney(actual)}</span>
        </div>

        {/* ส่วนยอดที่ขาด และยอดที่ต้องทำต่อวัน */}
        <div className={`p-3 sm:p-4 rounded-2xl border mt-auto ${isDark ? 'bg-slate-800/80 border-slate-700' : diff <= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          {diff > 0 ? (
            <>
              <div className="flex justify-between items-center mb-1">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>ยอดที่ขาด (Diff)</p>
                <p className={`text-sm font-black ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{formatMoney(diff)}</p>
              </div>
              <div className={`flex justify-between items-end mt-2 pt-2 border-t ${isDark ? 'border-rose-900/30' : 'border-rose-200/50'}`}>
                <p className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'} flex items-center gap-1`}><Zap size={14}/> ต้องทำรายวัน</p>
                <div className="text-right">
                  <p className={`text-xl sm:text-2xl font-black leading-none tracking-tight ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>{formatMoney(dailyRequired)}</p>
                  <p className={`text-[9px] font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/ วัน</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-3">
              <CheckCircle2 size={24} className={isDark ? 'text-emerald-400 mb-1' : 'text-emerald-500 mb-1'} />
              <p className={`text-sm font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>ถึงเป้าหมายแล้ว 🎉</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-10 font-sans max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500 tracking-tight mb-2 flex items-center gap-3">
          <Target size={32} className="text-rose-500" />
          Target Simulator
        </h1>
        <p className="text-slate-500 font-medium text-sm md:text-base">พิมพ์เปอร์เซ็นต์ที่ต้องการเพื่อจำลองเป้าหมายใหม่แยกรายหมวดหมู่</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-100 border-t-rose-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ========================================= */}
          {/* แผงตั้งค่าด้านซ้าย (Controls) */}
          {/* ========================================= */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* 1. เลือกพนักงาน */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">
                <User size={14} /> เลือกพนักงาน (เรียงตาม ID)
              </label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all relative z-10"
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
              >
                {data.map(opt => (
                  <option key={opt.OfficerID} value={opt.OfficerID}>
                    [{opt.OfficerID}] {opt.OfficerName}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. ตั้งค่าวันทำงาน */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <CalendarIcon size={14} /> วันทำงาน (Days)
              </label>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <input 
                  type="number" 
                  className="w-16 p-1.5 text-center text-base font-bold text-rose-600 bg-white border border-rose-100 rounded-lg outline-none shadow-sm"
                  value={passedDays}
                  onChange={(e) => setPassedDays(Number(e.target.value))}
                />
                <span className="text-slate-300 font-light text-lg">/</span>
                <input 
                  type="number" 
                  className="w-16 p-1.5 text-center text-base font-bold text-slate-600 bg-slate-100 border-none rounded-lg outline-none"
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                />
                <span className="text-xs font-bold text-slate-400 ml-1">วันในเดือน</span>
              </div>
              <div className="mt-3 p-2 bg-orange-50 border border-orange-100 rounded-lg text-center">
                <p className="text-xs font-bold text-orange-600">⏳ เหลือเวลาทำยอดอีก <span className="text-base">{remainingDays > 0 ? remainingDays : 0}</span> วัน</p>
              </div>
            </div>

          </div>

          {/* ========================================= */}
          {/* แผงแสดงผลด้านขวา (Grid ของหมวดหมู่) */}
          {/* ========================================= */}
          <div className="lg:col-span-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <SimCard key={cat.key} cat={cat} />
                ))}
             </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Calculator;