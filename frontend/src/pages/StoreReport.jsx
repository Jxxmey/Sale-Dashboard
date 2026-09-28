import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Camera, BarChart3, TrendingUp, TrendingDown, Minus, CalendarDays, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function StoreReport() {
  const [tmData, setTm] = useState(null); // This Month
  const [lmData, setLm] = useState(null); // Last Month
  const [lyData, setLy] = useState(null); // Last Year
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const captureRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const getStoreTotals = (dataArr) => {
    if (!dataArr || dataArr.length === 0) {
      return { Total: 0, Mac: 0, iPad: 0, iPhone: 0, AppleWatch: 0, ABA: 0, '3RD': 0, Sim: 0, CoverPlus: 0, PVL: 0, UFUND: 0 };
    }
    
    return dataArr.reduce((acc, curr) => {
      acc.Mac += curr.Mac || 0;
      acc.iPad += curr.iPad || 0;
      acc.iPhone += curr.iPhone || 0;
      acc.AppleWatch += curr['Apple Watch'] || 0;
      acc.ABA += curr.ABA || 0;
      acc['3RD'] += curr['3RD'] || 0;
      acc.Sim += curr.Sim || 0;
      acc.CoverPlus += curr['Cover+'] || 0;
      acc.PVL += curr.PVL || 0;
      acc.UFUND += curr['UFUND PERSONAL'] || 0;
      
      const rowTotal = (curr.Mac || 0) + (curr.iPad || 0) + (curr.iPhone || 0) + 
                       (curr['Apple Watch'] || 0) + (curr.ABA || 0) + (curr['3RD'] || 0) + (curr.PVL || 0);
      acc.Total += rowTotal;
      
      return acc;
    }, { Total: 0, Mac: 0, iPad: 0, iPhone: 0, AppleWatch: 0, ABA: 0, '3RD': 0, Sim: 0, CoverPlus: 0, PVL: 0, UFUND: 0 });
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // โหลดข้อมูล 3 ช่วงเวลาพร้อมกัน
      const [resTM, resLM, resLY] = await Promise.all([
        axios.get(`${API_URL}/summary/thismonth`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/summary/lastmonth`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/summary/lastyear`).catch(() => ({ data: [] }))
      ]);
      
      setTm(getStoreTotals(resTM.data));
      setLm(getStoreTotals(resLM.data));
      setLy(getStoreTotals(resLY.data));
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
    setLoading(false);
  };

  const formatMoney = (num) => {
    const val = Number(num);
    return val !== 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0';
  };

  const calcGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatDiff = (current, previous) => {
    const diff = current - previous;
    if (diff > 0) return `+${formatMoney(diff)}`;
    return formatMoney(diff);
  };

  const GrowthBadge = ({ current, previous }) => {
    const percent = calcGrowth(current, previous);
    const diffVal = formatDiff(current, previous);
    
    if (percent > 0) {
      return (
        <div className="flex flex-col items-end">
          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <TrendingUp size={12} /> {percent.toFixed(1)}%
          </span>
          <span className="text-[9px] font-bold text-emerald-500 mt-0.5">{diffVal}</span>
        </div>
      );
    } else if (percent < 0) {
      return (
        <div className="flex flex-col items-end">
          <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
            <TrendingDown size={12} /> {percent.toFixed(1)}%
          </span>
          <span className="text-[9px] font-bold text-rose-500 mt-0.5">{diffVal}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-end">
        <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          <Minus size={12} /> 0.0%
        </span>
        <span className="text-[9px] font-bold text-slate-400 mt-0.5">0</span>
      </div>
    );
  };

  const ReportCard = ({ title, current, lastMonth, lastYear, isTotal = false }) => {
    const isDark = isTotal;
    return (
      <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border flex flex-col transition-all duration-300 ${isDark ? 'bg-slate-900 border-slate-700 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:shadow-md'}`}>
        
        {/* หัวการ์ด */}
        <div className="flex justify-between items-center border-b pb-4 mb-4 border-slate-200/20">
          <h3 className={`font-black tracking-wide ${isDark ? 'text-white text-xl' : 'text-slate-700 text-lg'}`}>{title}</h3>
          <div className="text-right">
            <p className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${isDark ? 'text-indigo-300' : 'text-slate-400'}`}>This Month</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-indigo-600'}`}>{formatMoney(current)}</p>
          </div>
        </div>

        {/* ตารางเปรียบเทียบ */}
        <div className="flex flex-col gap-3">
          {/* MoM */}
          <div className={`flex justify-between items-center p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Month (MoM)</p>
              <p className={`text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatMoney(lastMonth)}</p>
            </div>
            <GrowthBadge current={current} previous={lastMonth} />
          </div>

          {/* YoY */}
          <div className={`flex justify-between items-center p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Year (YoY)</p>
              <p className={`text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatMoney(lastYear)}</p>
            </div>
            <GrowthBadge current={current} previous={lastYear} />
          </div>
        </div>

      </div>
    );
  };

  const handleCapture = async () => {
    if (!captureRef.current) return;
    setIsCapturing(true);
    try {
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 300));
      const canvas = await html2canvas(captureRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#f8fafc',
        onclone: (clonedDoc) => {
          const refEl = clonedDoc.getElementById('capture-container');
          if(refEl) refEl.style.width = '1000px'; 
        }
      });
      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          alert("✅ คัดลอกรูปภาพรายงาน MoM & YoY เรียบร้อยแล้ว!");
        } catch (err) { alert("❌ คัดลอกไม่สำเร็จ"); } 
        finally { setIsCapturing(false); }
      }, "image/png");
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
      setIsCapturing(false);
    }
  };

  return (
    <div className="pb-10 font-sans max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-indigo-700 mb-2 flex items-center gap-3 tracking-tight">
            <BarChart3 size={32} className="text-indigo-500" />
            Store Report
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">รายงานเปรียบเทียบยอดขายแบบ MoM (เดือนต่อเดือน) และ YoY (ปีต่อปี)</p>
        </div>
        
        <button 
          onClick={handleCapture}
          disabled={isCapturing || !tmData}
          className={`flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all ${
            isCapturing || !tmData ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg'
          }`}
        >
          <Camera size={18} />
          {isCapturing ? 'กำลังประมวลผล...' : 'คัดลอกรูปภาพรายงาน'}
        </button>
      </div>

      <div ref={captureRef} id="capture-container" className="p-2 sm:p-4 -mx-2 sm:-mx-4 bg-slate-50 rounded-3xl">
        <div className="mb-6 flex justify-center">
          <div className="px-6 py-2 bg-white border border-indigo-200 rounded-full shadow-sm flex items-center gap-2">
            <Activity size={16} className="text-indigo-500" />
            <span className="text-indigo-900 text-sm font-black uppercase tracking-widest">Store Performance (MoM / YoY)</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
          </div>
        ) : !tmData ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
             <CalendarDays size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-lg font-bold text-slate-400">กรุณาอัปโหลดข้อมูลยอดขายเดือนนี้, เดือนที่แล้ว และปีที่แล้ว ในหน้า Admin</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* กล่องสถิติใหญ่ (Total Store) */}
            <div className="w-full">
              <ReportCard 
                title="🏆 ยอดขายรวมทั้งร้าน (Total Store)" 
                current={tmData.Total} 
                lastMonth={lmData.Total} 
                lastYear={lyData.Total} 
                isTotal={true} 
              />
            </div>

            {/* Grid ย่อยรายหมวดหมู่ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <ReportCard title="🍎 Mac" current={tmData.Mac} lastMonth={lmData.Mac} lastYear={lyData.Mac} />
              <ReportCard title="🍎 iPad" current={tmData.iPad} lastMonth={lmData.iPad} lastYear={lyData.iPad} />
              <ReportCard title="🍎 iPhone" current={tmData.iPhone} lastMonth={lmData.iPhone} lastYear={lyData.iPhone} />
              <ReportCard title="⌚ Apple Watch" current={tmData.AppleWatch} lastMonth={lmData.AppleWatch} lastYear={lyData.AppleWatch} />
              <ReportCard title="🎧 ABA" current={tmData.ABA} lastMonth={lmData.ABA} lastYear={lyData.ABA} />
              <ReportCard title="🎧 3RD" current={tmData['3RD']} lastMonth={lmData['3RD']} lastYear={lyData['3RD']} />
              <ReportCard title="📱 SIM" current={tmData.Sim} lastMonth={lmData.Sim} lastYear={lyData.Sim} />
              <ReportCard title="📱 Cover+" current={tmData.CoverPlus} lastMonth={lmData.CoverPlus} lastYear={lyData.CoverPlus} />
              <ReportCard title="💳 PVL" current={tmData.PVL} lastMonth={lmData.PVL} lastYear={lyData.PVL} />
              <ReportCard title="🎓 UFUND" current={tmData.UFUND} lastMonth={lmData.UFUND} lastYear={lyData.UFUND} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default StoreReport;