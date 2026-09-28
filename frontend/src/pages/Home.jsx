import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Camera, Calendar as CalendarIcon, XCircle, Trophy, Medal, Award, AlertCircle, ChevronRight, X, Laptop, Smartphone, Watch, Headphones, CreditCard, ShieldCheck, Box, GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const [selectedDate, setSelectedDate] = useState(''); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  
  const captureRef = useRef(null);

  const kpiCover = Number(localStorage.getItem('kpiCover')) || 25;
  const kpiUfund = Number(localStorage.getItem('kpiUfund')) || 20;

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const dateParam = selectedDate ? `?date=${selectedDate}` : '';
      const res = await axios.get(`${API_URL}/summary/thismonth${dateParam}`);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const formatMoney = (num) => {
    const val = Number(num);
    return val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0';
  };

  const calculateRowTotal = (officer) => {
    return (officer.Mac || 0) + (officer.iPad || 0) + (officer.iPhone || 0) + 
           (officer['Apple Watch'] || 0) + (officer.ABA || 0) + (officer['3RD'] || 0) + (officer.PVL || 0);
  };

  const sortedData = [...data].sort((a, b) => calculateRowTotal(b) - calculateRowTotal(a));

  const storeTotals = sortedData.reduce((acc, curr) => {
    acc.Mac += curr.Mac || 0;
    acc.iPad += curr.iPad || 0;
    acc.iPhone += curr.iPhone || 0;
    acc.iPhone_18 += curr.iPhone_18 || 0;
    acc['Apple Watch'] += curr['Apple Watch'] || 0;
    acc['Cover+'] += curr['Cover+'] || 0;
    acc.Sim += curr.Sim || 0;
    acc.ABA += curr.ABA || 0;
    acc['3RD'] += curr['3RD'] || 0;
    acc.PVL += curr.PVL || 0;
    acc['UFUND PERSONAL'] += curr['UFUND PERSONAL'] || 0;
    acc.iPhone_Units += curr.iPhone_Units || 0;
    acc.RowTotal += calculateRowTotal(curr);
    return acc;
  }, {
    Mac: 0, iPad: 0, iPhone: 0, iPhone_18: 0, 'Apple Watch': 0, 'Cover+': 0, Sim: 0, ABA: 0, '3RD': 0, PVL: 0, 'UFUND PERSONAL': 0, iPhone_Units: 0, RowTotal: 0
  });

  const getAvatarColor = (name) => {
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const RankIcon = ({ rank }) => {
    if (rank === 1) return <div className="flex justify-center w-6"><Trophy className="text-yellow-500 drop-shadow-sm" size={20} fill="currentColor" /></div>;
    if (rank === 2) return <div className="flex justify-center w-6"><Medal className="text-slate-400 drop-shadow-sm" size={20} fill="currentColor" /></div>;
    if (rank === 3) return <div className="flex justify-center w-6"><Award className="text-amber-700 drop-shadow-sm" size={20} fill="currentColor" /></div>;
    return <div className="text-center font-black text-slate-300 text-sm w-6">{rank}</div>;
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
          if(refEl) refEl.style.width = '1200px'; 
          const desktopView = clonedDoc.getElementById('desktop-view');
          if (desktopView) { desktopView.classList.remove('hidden'); desktopView.style.display = 'flex'; }
          const mobileView = clonedDoc.getElementById('mobile-view');
          if (mobileView) mobileView.style.display = 'none';
          const scrollWrappers = clonedDoc.querySelectorAll('.overflow-x-auto');
          scrollWrappers.forEach(el => { el.style.overflow = 'visible'; el.style.width = 'max-content'; });
        }
      });
      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          alert("✅ คัดลอกรูปภาพเรียบร้อยแล้ว!\nสามารถนำไป Paste (Ctrl+V) ในแชทได้เลยครับ");
        } catch (err) { alert("❌ คัดลอกไม่สำเร็จ เบราว์เซอร์อาจไม่รองรับ"); } 
        finally { setIsCapturing(false); }
      }, "image/png");
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
      setIsCapturing(false);
    }
  };

  const ModalRow = ({ icon: Icon, label, value, colorClass = "text-slate-700", isMain = false, attachPct = null, kpi = null }) => (
    <div className={`flex justify-between items-center py-3.5 border-b border-slate-100 last:border-0 ${isMain ? 'bg-indigo-50/50 -mx-5 px-5 py-4 border-y border-indigo-100' : ''}`}>
      <div className="flex items-center gap-3">
        {Icon && <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMain ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}><Icon size={16} /></div>}
        <span className={`font-semibold ${isMain ? 'text-indigo-800 text-base' : 'text-slate-600 text-sm'}`}>{label}</span>
      </div>
      <div className="text-right">
        <div className={`font-black tracking-tight ${isMain ? 'text-indigo-600 text-xl' : `text-lg ${colorClass}`}`}>
          {formatMoney(value)}
        </div>
        {attachPct !== null && (
          <div className={`text-[10px] font-black ${attachPct >= kpi ? 'text-emerald-500' : 'text-rose-500'}`}>
            พ่วง iPhone: {attachPct.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pb-10 font-sans max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-indigo-700 mb-1 tracking-tight">Daily Leaderboard</h1>
          <p className="text-sm text-slate-500 font-medium">สรุปยอดขายรายวัน</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 px-3">
            <CalendarIcon size={18} className="text-indigo-500 mr-2" />
            <input type="date" className="p-1 text-sm font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="text-slate-400 hover:text-rose-500 ml-2"><XCircle size={18} /></button>
            )}
          </div>
          <button onClick={handleCapture} disabled={isCapturing || sortedData.length === 0} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all ${isCapturing || sortedData.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5'}`}>
            <Camera size={18} /> {isCapturing ? 'ประมวลผล...' : 'คัดลอกรูปภาพ'}
          </button>
        </div>
      </div>

      <div ref={captureRef} id="capture-container" className="p-0 sm:p-4 bg-transparent sm:bg-slate-50 rounded-3xl">
        <div className="mb-6 flex justify-center">
          <div className="px-5 py-2 bg-white border border-indigo-100 rounded-full shadow-sm flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedDate ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
            <span className="text-indigo-900 text-xs sm:text-sm font-bold tracking-wide">
              {selectedDate ? `ยอดประจำวันที่: ${selectedDate}` : 'ยอดขายสะสมรวมทั้งหมด'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div></div>
        ) : (
          <>
            <div id="desktop-view" className="hidden lg:flex flex-col gap-6">
              
              {/* ======================================= */}
              {/* 1. ตารางยอดขายปกติ (Main Table) */}
              {/* ======================================= */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-max">
                    <thead>
                      <tr>
                        <th colSpan="3" className="bg-white"></th>
                        <th className="text-center py-2 text-[10px] font-bold text-white bg-indigo-600 border-b-2 border-indigo-700">🏆 ยอดรวมทั้งหมด (Total)</th>
                        <th colSpan="4" className="text-center py-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 border-b-2 border-indigo-100 border-l border-white">🍎 Apple Core</th>
                        <th colSpan="2" className="text-center py-2 text-[10px] font-bold text-teal-700 bg-teal-50 border-b-2 border-teal-100 border-l border-white">🎧 Accessories</th>
                        <th colSpan="3" className="text-center py-2 text-[10px] font-bold text-amber-700 bg-amber-50 border-b-2 border-amber-100 border-l border-white">📱 Services</th>
                        <th colSpan="1" className="text-center py-2 text-[10px] font-bold text-rose-700 bg-rose-50 border-b-2 border-rose-100 border-l border-white">🎓 Special</th>
                      </tr>
                      <tr className="text-[11px] text-slate-600 uppercase border-b border-slate-200 bg-slate-50/80">
                        <th className="px-4 py-3 text-center font-bold">Rank</th>
                        <th className="px-4 py-3 font-bold">พนักงาน (Sales)</th>
                        <th className="px-2 py-3 font-bold text-slate-400">รหัส</th>
                        <th className="px-5 py-3 text-right text-indigo-700 font-bold border-l border-slate-200">Total Sales</th>
                        <th className="px-4 py-3 text-right font-bold border-l border-slate-200">Mac</th>
                        <th className="px-4 py-3 text-right font-bold">iPad</th>
                        <th className="px-4 py-3 text-right font-bold">iPhone</th>
                        <th className="px-4 py-3 text-right font-bold">Watch</th>
                        <th className="px-4 py-3 text-right font-bold border-l border-slate-200">ABA</th>
                        <th className="px-4 py-3 text-right font-bold">3RD</th>
                        <th className="px-4 py-3 text-right font-bold border-l border-slate-200">Cover+ <br/><span className="text-[8px] text-slate-400 font-medium">เป้า {kpiCover}% (เทียบ iPhone)</span></th>
                        <th className="px-4 py-3 text-right font-bold">Sim</th>
                        <th className="px-4 py-3 text-right font-bold">PVL</th>
                        <th className="px-5 py-3 text-center font-bold border-l border-slate-200">UFUND <br/><span className="text-[8px] text-slate-400 font-medium">เป้า {kpiUfund}% (เทียบ iPhone)</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedData.map((officer, index) => {
                        const total = calculateRowTotal(officer);
                        
                        // 🌟 เทียบเปอร์เซ็นต์เฉพาะจำนวนเครื่อง iPhone
                        const iphoneUnits = officer.iPhone_Units || 0;
                        const coverPct = iphoneUnits > 0 ? (officer['Cover+'] / iphoneUnits) * 100 : 0;
                        const ufundPct = iphoneUnits > 0 ? (officer['UFUND PERSONAL'] / iphoneUnits) * 100 : 0;

                        return (
                          <tr key={index} className="hover:bg-indigo-50/30 transition-colors whitespace-nowrap">
                            <td className="px-4 py-3 align-middle"><RankIcon rank={index + 1} /></td>
                            <td className="px-4 py-3 flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm ${getAvatarColor(officer.OfficerName)}`}>
                                {officer.OfficerName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-700 text-sm">{officer.OfficerName}</span>
                            </td>
                            <td className="px-2 py-3 text-[10px] text-slate-400 font-mono">{officer.OfficerID}</td>
                            <td className="px-5 py-3 text-right font-black text-indigo-600 bg-indigo-50/40 border-l border-slate-100 text-sm">{formatMoney(total)}</td>
                            
                            <td className="px-4 py-3 text-right text-slate-600 border-l border-slate-100">{formatMoney(officer.Mac)}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatMoney(officer.iPad)}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatMoney(officer.iPhone)}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatMoney(officer['Apple Watch'])}</td>
                            <td className="px-4 py-3 text-right text-slate-600 border-l border-slate-100">{formatMoney(officer.ABA)}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatMoney(officer['3RD'])}</td>
                            
                            <td className="px-4 py-2 text-right border-l border-slate-100">
                              <div className="font-bold text-slate-600">{formatMoney(officer['Cover+'])}</div>
                              <div className={`text-[10px] font-black ${coverPct >= kpiCover ? 'text-emerald-500' : 'text-rose-500'}`}>({coverPct.toFixed(0)}%)</div>
                            </td>

                            <td className="px-4 py-3 text-right text-slate-500">{formatMoney(officer.Sim)}</td>
                            <td className="px-4 py-3 text-right text-slate-500">{formatMoney(officer.PVL)}</td>
                            
                            <td className="px-5 py-2 text-center border-l border-slate-100 bg-rose-50/30">
                              <div className="font-bold text-rose-600">{officer['UFUND PERSONAL']}</div>
                              <div className={`text-[10px] font-black ${ufundPct >= kpiUfund ? 'text-emerald-500' : 'text-rose-500'}`}>({ufundPct.toFixed(0)}%)</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {sortedData.length > 0 && (() => {
                      const storeIphoneUnits = storeTotals.iPhone_Units || 0;
                      const storeCoverPct = storeIphoneUnits > 0 ? (storeTotals['Cover+'] / storeIphoneUnits) * 100 : 0;
                      const storeUfundPct = storeIphoneUnits > 0 ? (storeTotals['UFUND PERSONAL'] / storeIphoneUnits) * 100 : 0;

                      return (
                        <tfoot className="bg-slate-800 text-white font-bold whitespace-nowrap">
                          <tr>
                            <td colSpan="3" className="px-5 py-4 text-right text-slate-400 text-[10px] uppercase tracking-widest">Total Store :</td>
                            <td className="px-5 py-4 text-right text-indigo-300 text-base border-l border-slate-700 bg-white/5">{formatMoney(storeTotals.RowTotal)}</td>
                            <td className="px-4 py-4 text-right border-l border-slate-700 text-slate-300">{formatMoney(storeTotals.Mac)}</td>
                            <td className="px-4 py-4 text-right text-slate-300">{formatMoney(storeTotals.iPad)}</td>
                            <td className="px-4 py-4 text-right text-slate-300">{formatMoney(storeTotals.iPhone)}</td>
                            <td className="px-4 py-4 text-right text-slate-300">{formatMoney(storeTotals['Apple Watch'])}</td>
                            <td className="px-4 py-4 text-right border-l border-slate-700 text-slate-300">{formatMoney(storeTotals.ABA)}</td>
                            <td className="px-4 py-4 text-right text-slate-300">{formatMoney(storeTotals['3RD'])}</td>
                            <td className="px-4 py-3 text-right border-l border-slate-700">
                               <div className="text-slate-300">{formatMoney(storeTotals['Cover+'])}</div>
                               <div className={`text-[9px] ${storeCoverPct >= kpiCover ? 'text-emerald-400' : 'text-rose-400'}`}>({storeCoverPct.toFixed(1)}%)</div>
                            </td>
                            <td className="px-4 py-4 text-right text-slate-400">{formatMoney(storeTotals.Sim)}</td>
                            <td className="px-4 py-4 text-right text-slate-400">{formatMoney(storeTotals.PVL)}</td>
                            <td className="px-5 py-3 text-center border-l border-slate-700 bg-rose-900/30">
                               <div className="text-rose-300">{storeTotals['UFUND PERSONAL']}</div>
                               <div className={`text-[9px] ${storeUfundPct >= kpiUfund ? 'text-emerald-400' : 'text-rose-400'}`}>({storeUfundPct.toFixed(1)}%)</div>
                            </td>
                          </tr>
                        </tfoot>
                      )
                    })()}
                  </table>
                </div>
              </div>

              {/* ======================================= */}
              {/* 2. ตารางพิเศษ: หักลบ iPhone 18 */}
              {/* ======================================= */}
              {sortedData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border-2 border-rose-100 overflow-hidden mt-2">
                  <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center gap-3">
                    <AlertCircle size={20} className="text-rose-500" />
                    <div>
                      <h2 className="text-sm font-black text-rose-700">ตารางสรุปยอดขาย (ไม่รวมยอดขาย iPhone 18 Pro / Pro Max)</h2>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse min-w-max">
                      <thead>
                        <tr className="bg-white">
                          <th colSpan="2" className="px-3 py-2"></th>
                          <th className="px-4 py-2 text-center font-black text-indigo-700 bg-indigo-50 border-b-2 border-indigo-200 border-l border-slate-200">🏆 Adjusted Total</th>
                          <th className="px-4 py-2 text-center font-black text-rose-700 bg-rose-50 border-b-2 border-rose-200 border-l border-white">🍎 Adjusted iPhone</th>
                          <th colSpan="8" className="px-2 py-2 text-center font-bold text-slate-600 bg-slate-50 border-b-2 border-slate-200 border-l border-white">หมวดหมู่อื่นๆ (ยอดปกติ)</th>
                        </tr>
                        <tr className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-center font-bold">Rank</th>
                          <th className="px-4 py-3 font-bold">พนักงาน</th>
                          <th className="px-5 py-3 text-right font-bold border-l border-slate-200">Adj. Total Sales</th>
                          <th className="px-5 py-3 text-right font-bold border-l border-slate-200">Adj. iPhone</th>
                          <th className="px-4 py-3 text-right font-bold border-l border-slate-200">Mac</th>
                          <th className="px-4 py-3 text-right font-bold">iPad</th>
                          <th className="px-4 py-3 text-right font-bold">Watch</th>
                          <th className="px-4 py-3 text-right font-bold">ABA</th>
                          <th className="px-4 py-3 text-right font-bold">3RD</th>
                          <th className="px-4 py-3 text-right font-bold">Cover+</th>
                          <th className="px-4 py-3 text-right font-bold">Sim</th>
                          <th className="px-4 py-3 text-right font-bold">PVL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedData.map((officer, index) => {
                          const iphone18 = officer.iPhone_18 || 0;
                          const adjTotal = calculateRowTotal(officer) - iphone18;
                          const adjIphone = (officer.iPhone || 0) - iphone18;
                          return (
                            <tr key={index} className="hover:bg-rose-50/30 transition-colors whitespace-nowrap">
                              <td className="px-4 py-3 align-middle"><RankIcon rank={index + 1} /></td>
                              <td className="px-4 py-3 font-bold text-slate-700">{officer.OfficerName}</td>
                              <td className="px-5 py-3 text-right font-black text-indigo-700 bg-indigo-50/50 border-l border-slate-100">{formatMoney(adjTotal)}</td>
                              <td className="px-5 py-3 text-right font-black text-rose-700 bg-rose-50/50 border-l border-slate-100">{formatMoney(adjIphone)}</td>
                              <td className="px-4 py-3 text-right text-slate-600 border-l border-slate-100">{formatMoney(officer.Mac)}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatMoney(officer.iPad)}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatMoney(officer['Apple Watch'])}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatMoney(officer.ABA)}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatMoney(officer['3RD'])}</td>
                              <td className="px-4 py-3 text-right text-slate-500">{formatMoney(officer['Cover+'])}</td>
                              <td className="px-4 py-3 text-right text-slate-500">{formatMoney(officer.Sim)}</td>
                              <td className="px-4 py-3 text-right text-slate-500">{formatMoney(officer.PVL)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-800 text-white font-bold whitespace-nowrap">
                        <tr>
                          <td colSpan="2" className="px-5 py-4 text-right text-slate-400 text-[10px] uppercase tracking-widest">Adj. Total Store :</td>
                          <td className="px-5 py-4 text-right text-indigo-300 text-sm font-black border-l border-slate-700 bg-indigo-900/30">{formatMoney(storeTotals.RowTotal - storeTotals.iPhone_18)}</td>
                          <td className="px-5 py-4 text-right text-rose-300 text-sm font-black border-l border-slate-700 bg-rose-900/30">{formatMoney(storeTotals.iPhone - storeTotals.iPhone_18)}</td>
                          <td className="px-4 py-4 text-right text-slate-300 border-l border-slate-700">{formatMoney(storeTotals.Mac)}</td>
                          <td className="px-4 py-4 text-right text-slate-300">{formatMoney(storeTotals.iPad)}</td>
                          <td className="px-4 py-4 text-right text-slate-300">{formatMoney(storeTotals['Apple Watch'])}</td>
                          <td className="px-4 py-4 text-right text-slate-300">{formatMoney(storeTotals.ABA)}</td>
                          <td className="px-4 py-4 text-right text-slate-300">{formatMoney(storeTotals['3RD'])}</td>
                          <td className="px-4 py-4 text-right text-slate-400">{formatMoney(storeTotals['Cover+'])}</td>
                          <td className="px-4 py-4 text-right text-slate-400">{formatMoney(storeTotals.Sim)}</td>
                          <td className="px-4 py-4 text-right text-slate-400">{formatMoney(storeTotals.PVL)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* โหมด Mobile รายชื่อ List */}
            <div id="mobile-view" className="lg:hidden flex flex-col gap-3 pb-8">
              <div onClick={() => setSelectedOfficer({ isStoreInfo: true })} className="bg-indigo-600 rounded-3xl p-5 shadow-lg shadow-indigo-500/30 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer mb-2">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"><Trophy size={24}/></div>
                  <div>
                    <p className="font-black text-xl tracking-tight">Total Store</p>
                    <p className="text-xs text-indigo-200 font-medium">ยอดขายรวมทั้งร้าน</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <div className="text-right"><p className="font-black text-2xl tracking-tighter">{formatMoney(storeTotals.RowTotal)}</p></div>
                  <ChevronRight size={24} className="text-indigo-300 ml-1 opacity-50" />
                </div>
              </div>

              {sortedData.map((officer, index) => {
                const total = calculateRowTotal(officer);
                return (
                  <div key={index} onClick={() => setSelectedOfficer(officer)} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between active:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <RankIcon rank={index + 1} />
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-inner ${getAvatarColor(officer.OfficerName)}`}>
                        {officer.OfficerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{officer.OfficerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-wider">ID: {officer.OfficerID}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-indigo-600 text-lg sm:text-xl tracking-tight">{formatMoney(total)}</p>
                      <ChevronRight size={20} className="text-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal Popup แสดงรายละเอียดบนมือถือ */}
      {selectedOfficer && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4 transition-all duration-300">
          <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-8 relative overflow-hidden">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 bg-white/90 backdrop-blur-md">
              <div className="flex items-center gap-4">
                {selectedOfficer.isStoreInfo ? (
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md"><Trophy size={28}/></div>
                ) : (
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md ${getAvatarColor(selectedOfficer.OfficerName)}`}>
                    {selectedOfficer.OfficerName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-slate-800 text-xl">{selectedOfficer.isStoreInfo ? 'Total Store' : selectedOfficer.OfficerName}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedOfficer.isStoreInfo ? 'สรุปยอดรวมทั้งร้าน' : `รหัสพนักงาน: ${selectedOfficer.OfficerID}`}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOfficer(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors">
                <X size={20}/>
              </button>
            </div>

            <div className="px-5 py-2 overflow-y-auto pb-8">
              <ModalRow icon={Trophy} label="ยอดรวมทั้งหมด (Total)" value={selectedOfficer.isStoreInfo ? storeTotals.RowTotal : calculateRowTotal(selectedOfficer)} isMain={true} />
              
              <div className="bg-rose-50/80 border border-rose-100 p-4 rounded-2xl my-4">
                 <p className="text-xs font-black text-rose-500 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertCircle size={14}/> Adjusted Sales (หัก iPhone 18)
                 </p>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-semibold text-slate-600">Total (ที่หักแล้ว)</span>
                   <span className="font-black text-lg text-rose-700">{formatMoney(selectedOfficer.isStoreInfo ? storeTotals.RowTotal - storeTotals.iPhone_18 : calculateRowTotal(selectedOfficer) - (selectedOfficer.iPhone_18 || 0))}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-semibold text-slate-600">iPhone (ที่หักแล้ว)</span>
                   <span className="font-black text-lg text-rose-700">{formatMoney(selectedOfficer.isStoreInfo ? storeTotals.iPhone - storeTotals.iPhone_18 : (selectedOfficer.iPhone || 0) - (selectedOfficer.iPhone_18 || 0))}</span>
                 </div>
              </div>

              <div className="mt-2 flex flex-col">
                <ModalRow icon={Laptop} label="Mac" value={selectedOfficer.isStoreInfo ? storeTotals.Mac : selectedOfficer.Mac} colorClass="text-slate-700" />
                <ModalRow icon={Smartphone} label="iPad" value={selectedOfficer.isStoreInfo ? storeTotals.iPad : selectedOfficer.iPad} colorClass="text-slate-700" />
                <ModalRow icon={Smartphone} label="iPhone" value={selectedOfficer.isStoreInfo ? storeTotals.iPhone : selectedOfficer.iPhone} colorClass="text-slate-700" />
                <ModalRow icon={Watch} label="Apple Watch" value={selectedOfficer.isStoreInfo ? storeTotals['Apple Watch'] : selectedOfficer['Apple Watch']} colorClass="text-purple-600" />
                <ModalRow icon={Headphones} label="ABA" value={selectedOfficer.isStoreInfo ? storeTotals.ABA : selectedOfficer.ABA} colorClass="text-teal-600" />
                <ModalRow icon={Headphones} label="3RD" value={selectedOfficer.isStoreInfo ? storeTotals['3RD'] : selectedOfficer['3RD']} colorClass="text-teal-600" />
                
                <ModalRow 
                  icon={ShieldCheck} 
                  label="Cover+" 
                  value={selectedOfficer.isStoreInfo ? storeTotals['Cover+'] : selectedOfficer['Cover+']} 
                  colorClass="text-amber-600"
                  attachPct={selectedOfficer.isStoreInfo ? (storeTotals.iPhone_Units > 0 ? (storeTotals['Cover+'] / storeTotals.iPhone_Units)*100 : 0) : (selectedOfficer.iPhone_Units > 0 ? (selectedOfficer['Cover+'] / selectedOfficer.iPhone_Units)*100 : 0)}
                  kpi={kpiCover}
                />
                
                <ModalRow icon={CreditCard} label="SIM" value={selectedOfficer.isStoreInfo ? storeTotals.Sim : selectedOfficer.Sim} colorClass="text-amber-600" />
                <ModalRow icon={Box} label="PVL" value={selectedOfficer.isStoreInfo ? storeTotals.PVL : selectedOfficer.PVL} colorClass="text-slate-600" />
                
                <ModalRow 
                  icon={GraduationCap} 
                  label="UFUND" 
                  value={selectedOfficer.isStoreInfo ? storeTotals['UFUND PERSONAL'] : selectedOfficer['UFUND PERSONAL']} 
                  colorClass="text-rose-600"
                  attachPct={selectedOfficer.isStoreInfo ? (storeTotals.iPhone_Units > 0 ? (storeTotals['UFUND PERSONAL'] / storeTotals.iPhone_Units)*100 : 0) : (selectedOfficer.iPhone_Units > 0 ? (selectedOfficer['UFUND PERSONAL'] / selectedOfficer.iPhone_Units)*100 : 0)}
                  kpi={kpiUfund}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;