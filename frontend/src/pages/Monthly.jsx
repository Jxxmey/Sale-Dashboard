import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Camera, TrendingUp, Trophy, Medal, Award, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Monthly() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef(null);
  
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
      setData(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const formatMoney = (num) => {
    const val = Number(num);
    return val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-';
  };

  const calculateActual = (officer) => {
    return (officer.Mac || 0) + (officer.iPad || 0) + (officer.iPhone || 0) + 
           (officer['Apple Watch'] || 0) + (officer.ABA || 0) + (officer['3RD'] || 0) + (officer.PVL || 0);
  };

  const calcForecast = (actual) => {
    return passedDays > 0 ? (actual / passedDays) * totalDays : 0;
  };

  const sortedData = [...data].sort((a, b) => calculateActual(b) - calculateActual(a));

  const storeTotals = sortedData.reduce((acc, curr) => {
    acc.Target_Total += curr.Target_Total || 0;
    acc.Target_Mac += curr.Target_Mac || 0;
    acc.Target_iPad += curr.Target_iPad || 0;
    acc.Target_iPhone += curr.Target_iPhone || 0;
    acc.Target_AppleWatch += curr.Target_AppleWatch || 0;
    acc.Target_Sim += curr.Target_Sim || 0;
    acc.Target_ABA += curr.Target_ABA || 0;
    acc.Target_3RD += curr.Target_3RD || 0;
    
    acc.Mac += curr.Mac || 0;
    acc.iPad += curr.iPad || 0;
    acc.iPhone += curr.iPhone || 0;
    acc.iPhone_18 += curr.iPhone_18 || 0; // 🌟 เก็บยอด iPhone 18 ของร้าน
    acc['Apple Watch'] += curr['Apple Watch'] || 0;
    acc.Sim += curr.Sim || 0;
    acc.ABA += curr.ABA || 0;
    acc['3RD'] += curr['3RD'] || 0;
    acc['Cover+'] += curr['Cover+'] || 0;
    acc.PVL += curr.PVL || 0;
    acc['UFUND PERSONAL'] += curr['UFUND PERSONAL'] || 0;
    acc.Actual_Total += calculateActual(curr);
    return acc;
  }, { 
    Target_Total: 0, Target_Mac: 0, Target_iPad: 0, Target_iPhone: 0, Target_AppleWatch: 0, Target_Sim: 0, Target_ABA: 0, Target_3RD: 0, 
    Actual_Total: 0, Mac: 0, iPad: 0, iPhone: 0, iPhone_18: 0, 'Apple Watch': 0, Sim: 0, ABA: 0, '3RD': 0, 'Cover+': 0, PVL: 0, 'UFUND PERSONAL': 0 
  });

  const getAvatarColor = (name) => {
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const RankIcon = ({ rank }) => {
    if (rank === 1) return <Trophy className="text-yellow-500 drop-shadow-sm" size={24} fill="currentColor" />;
    if (rank === 2) return <Medal className="text-slate-300 drop-shadow-sm" size={24} fill="currentColor" />;
    if (rank === 3) return <Award className="text-amber-600 drop-shadow-sm" size={24} fill="currentColor" />;
    return <div className="w-6 h-6 flex items-center justify-center font-black text-slate-300 text-lg">{rank}</div>;
  };

  const PercentBadge = ({ value }) => {
    const num = Number(value);
    if (num <= 0 || isNaN(num)) return <span className="text-slate-400 text-[9px] font-medium">-</span>;
    if (num >= 100) return <span className="text-emerald-600 text-[10px] font-black">({num.toFixed(0)}%)</span>;
    if (num >= 80) return <span className="text-amber-600 text-[10px] font-black">({num.toFixed(0)}%)</span>;
    return <span className="text-rose-500 text-[10px] font-black">({num.toFixed(0)}%)</span>;
  };

  const CategoryCard = ({ title, target, actual, hasTarget = true, hasForecast = true, colorTheme = "indigo" }) => {
    const forecast = calcForecast(actual);
    const themes = {
      indigo: { header: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      purple: { header: 'bg-purple-100 text-purple-800 border-purple-200' },
      teal: { header: 'bg-teal-100 text-teal-800 border-teal-200' },
      amber: { header: 'bg-amber-100 text-amber-800 border-amber-200' },
      rose: { header: 'bg-rose-100 text-rose-800 border-rose-200' },
      dark: { header: 'bg-slate-700 text-white border-slate-600' }
    };
    const isDark = colorTheme === 'dark';

    return (
      <div className={`rounded-lg border flex flex-col overflow-hidden shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`${themes[colorTheme].header} text-center text-[11px] font-black py-1.5 uppercase tracking-wide border-b`}>
          {title}
        </div>
        <div className="flex flex-col p-1.5 gap-1">
          {hasTarget && (
            <div className={`flex justify-between items-center text-[10px] px-1.5 py-1 rounded ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
              <span className="font-semibold">Target</span>
              <span className="font-bold">{formatMoney(target)}</span>
            </div>
          )}
          <div className={`flex justify-between items-center text-[10px] px-1.5 py-1 rounded ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
            <span className="font-bold">Actual</span>
            <div className="flex items-center gap-1">
              <span className="font-black">{formatMoney(actual)}</span>
              {hasTarget && <PercentBadge value={target > 0 ? (actual / target) * 100 : 0} />}
            </div>
          </div>
          {hasForecast && (
            <div className={`flex justify-between items-center text-[10px] px-1.5 py-1 rounded ${isDark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
              <span className="font-bold">Forecast</span>
              <div className="flex items-center gap-1">
                <span className="font-black">{formatMoney(forecast)}</span>
                {hasTarget && <PercentBadge value={target > 0 ? (forecast / target) * 100 : 0} />}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdjKPI = (target, actual, isTotal = false) => {
    const forecast = calcForecast(actual);
    const color = isTotal ? 'text-indigo-700 bg-indigo-50/50' : 'text-rose-700 bg-rose-50/50';
    return (
      <React.Fragment>
        <td className={`px-2 py-2 text-right border-l-2 border-slate-300 font-bold ${color}`}>{formatMoney(actual)}</td>
        <td className="px-1 py-2 text-center"><PercentBadge value={target > 0 ? (actual / target) * 100 : 0} /></td>
        <td className={`px-2 py-2 text-right font-bold text-slate-700 bg-slate-50/50`}>{formatMoney(forecast)}</td>
        <td className="px-1 py-2 text-center"><PercentBadge value={target > 0 ? (forecast / target) * 100 : 0} /></td>
      </React.Fragment>
    );
  };

  const handleCapture = async () => {
    if (!captureRef.current) return;
    setIsCapturing(true);
    try {
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
        onclone: (clonedDoc) => {
          const refEl = clonedDoc.getElementById('capture-container');
          if(refEl) refEl.style.width = '1200px'; 
          
          const scrollWrappers = clonedDoc.querySelectorAll('.overflow-x-auto');
          scrollWrappers.forEach(el => {
            el.style.overflow = 'visible';
            el.style.width = 'max-content';
          });
        }
      });
      
      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          alert("✅ คัดลอกรูปภาพลงคลิปบอร์ดเรียบร้อยแล้ว!\nสามารถกด Paste (Ctrl+V) ลงในแชทได้เลยครับ");
        } catch (err) {
          alert("❌ คัดลอกไม่สำเร็จ เบราว์เซอร์อาจไม่รองรับ");
        } finally { setIsCapturing(false); }
      }, "image/png");
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
      setIsCapturing(false);
    }
  };

  return (
    <div className="pb-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-indigo-700 mb-1">Monthly Leaderboard</h1>
          <p className="text-sm text-slate-500 font-medium">สรุปยอดขายรายเดือน พร้อมตารางหักลบ iPhone 18</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1 px-2">
            <TrendingUp size={16} className="text-purple-500 mr-2" />
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Forecast:</span>
            <input type="number" className="w-10 p-0.5 text-center text-xs font-bold text-indigo-700 bg-indigo-50 outline-none rounded" value={passedDays} onChange={(e) => setPassedDays(Number(e.target.value))} />
            <span className="text-slate-400 mx-1">/</span>
            <input type="number" className="w-10 p-0.5 text-center text-xs font-bold text-slate-700 bg-slate-100 outline-none rounded" value={totalDays} onChange={(e) => setTotalDays(Number(e.target.value))} />
          </div>

          <button onClick={handleCapture} disabled={isCapturing || sortedData.length === 0} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold shadow-md ${isCapturing ? 'bg-slate-200 text-slate-400' : 'bg-purple-600 text-white hover:bg-purple-700 transition-colors'}`}>
            <Camera size={16} />
            {isCapturing ? 'กำลังประมวลผล...' : 'คัดลอกรูปภาพ (Copy)'}
          </button>
        </div>
      </div>

      {/* 🌟 กล่องใหญ่ครอบทั้งหมดสำหรับแคปรูป */}
      <div ref={captureRef} id="capture-container" className="bg-slate-50 p-2 sm:p-4 rounded-2xl mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="px-5 py-2 bg-white shadow-sm border border-indigo-100 rounded-full flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-indigo-900 text-sm font-black tracking-wide">ยอดขายประจำเดือน {today.toLocaleString('default', { month: 'long' })} (Monthly)</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* 1. กล่องสรุปยอดรวมทั้งร้าน (ปกติ) */}
            {sortedData.length > 0 && (
              <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-700 p-4 sm:p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-wide">สรุปยอดรวมทั้งร้าน (Total Store)</h2>
                      <p className="text-xs text-slate-400">ภาพรวมผลประกอบการทุกหมวดหมู่ (ยอดรวมปกติ)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Sales</p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                      {formatMoney(storeTotals.Actual_Total)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  <CategoryCard title="🏆 Total (รวม)" target={storeTotals.Target_Total} actual={storeTotals.Actual_Total} colorTheme="dark" />
                  <CategoryCard title="🍎 Mac" target={storeTotals.Target_Mac} actual={storeTotals.Mac} colorTheme="dark" />
                  <CategoryCard title="🍎 iPad" target={storeTotals.Target_iPad} actual={storeTotals.iPad} colorTheme="dark" />
                  <CategoryCard title="🍎 iPhone" target={storeTotals.Target_iPhone} actual={storeTotals.iPhone} colorTheme="dark" />
                  <CategoryCard title="⌚ Watch" target={storeTotals.Target_AppleWatch} actual={storeTotals['Apple Watch']} colorTheme="dark" />
                  <CategoryCard title="🎧 ABA" target={storeTotals.Target_ABA} actual={storeTotals.ABA} colorTheme="dark" />
                  <CategoryCard title="🎧 3RD" target={storeTotals.Target_3RD} actual={storeTotals['3RD']} colorTheme="dark" />
                  <CategoryCard title="📱 SIM" target={storeTotals.Target_Sim} actual={storeTotals.Sim} colorTheme="dark" />
                  <CategoryCard title="📱 Cover+" actual={storeTotals['Cover+']} hasTarget={false} colorTheme="dark" />
                  <CategoryCard title="📱 PVL" actual={storeTotals.PVL} hasTarget={false} hasForecast={false} colorTheme="dark" />
                  <CategoryCard title="🎓 UFUND" actual={storeTotals['UFUND PERSONAL']} hasTarget={false} hasForecast={false} colorTheme="dark" />
                </div>
              </div>
            )}

            {/* 2. การ์ดพนักงานรายบุคคล (ปกติ) */}
            <div className="flex flex-col gap-4">
              {sortedData.map((officer, index) => {
                const total = calculateActual(officer);
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 mb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <RankIcon rank={index + 1} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-inner ${getAvatarColor(officer.OfficerName)}`}>
                          {officer.OfficerName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 text-lg leading-none">{officer.OfficerName}</h3>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">ID: {officer.OfficerID}</p>
                        </div>
                      </div>
                      <div className="sm:text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total Sales</p>
                        <p className="text-xl font-black text-indigo-600 leading-none">{formatMoney(total)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                      <CategoryCard title="🏆 Total (รวม)" target={officer.Target_Total} actual={total} colorTheme="indigo" />
                      <CategoryCard title="🍎 Mac" target={officer.Target_Mac} actual={officer.Mac} colorTheme="purple" />
                      <CategoryCard title="🍎 iPad" target={officer.Target_iPad} actual={officer.iPad} colorTheme="purple" />
                      <CategoryCard title="🍎 iPhone" target={officer.Target_iPhone} actual={officer.iPhone} colorTheme="purple" />
                      <CategoryCard title="⌚ Watch" target={officer.Target_AppleWatch} actual={officer['Apple Watch']} colorTheme="purple" />
                      <CategoryCard title="🎧 ABA" target={officer.Target_ABA} actual={officer.ABA} colorTheme="teal" />
                      <CategoryCard title="🎧 3RD" target={officer.Target_3RD} actual={officer['3RD']} colorTheme="teal" />
                      <CategoryCard title="📱 SIM" target={officer.Target_Sim} actual={officer.Sim} colorTheme="amber" />
                      <CategoryCard title="📱 Cover+" actual={officer['Cover+']} hasTarget={false} colorTheme="amber" />
                      <CategoryCard title="📱 PVL" actual={officer.PVL} hasTarget={false} hasForecast={false} colorTheme="amber" />
                      <CategoryCard title="🎓 UFUND" actual={officer['UFUND PERSONAL']} hasTarget={false} hasForecast={false} colorTheme="rose" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 🌟 3. ตารางพิเศษด้านล่าง: หักลบ iPhone 18 */}
            {sortedData.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl shadow-md border-2 border-rose-100 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={20} className="text-rose-500" />
                  <div>
                    <h2 className="text-base font-black text-rose-600">ตารางสรุปยอดขาย (ไม่รวมยอดขาย iPhone 18 Pro / Pro Max)</h2>
                    <p className="text-[11px] text-slate-500 font-medium">ยอด Total และ iPhone ในตารางนี้ ถูกหักลบยอดขาย iPhone 18 Pro/Pro Max ออกแล้ว</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse min-w-max">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th rowSpan="2" className="px-3 py-2 text-center font-bold text-slate-600">Rank</th>
                          <th rowSpan="2" className="px-3 py-2 font-bold text-slate-600">พนักงาน</th>
                          <th colSpan="4" className="px-2 py-1.5 text-center font-black text-indigo-700 bg-indigo-50 border-b border-indigo-200 border-l-2 border-slate-300">🏆 Adjusted Total</th>
                          <th colSpan="4" className="px-2 py-1.5 text-center font-black text-rose-700 bg-rose-50 border-b border-rose-200 border-l-2 border-slate-300">🍎 Adjusted iPhone</th>
                          <th colSpan="8" className="px-2 py-1.5 text-center font-bold text-slate-500 border-b border-slate-200 border-l-2 border-slate-300">หมวดหมู่อื่นๆ (Actual)</th>
                        </tr>
                        <tr className="text-[9px] text-slate-500 uppercase bg-slate-50">
                          <th className="px-2 py-1.5 text-right border-b border-slate-200 border-l-2 border-slate-300">Act.</th><th className="px-1 py-1.5 text-center border-b border-slate-200">%</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">Fcst.</th><th className="px-1 py-1.5 text-center border-b border-slate-200">%</th>
                          
                          <th className="px-2 py-1.5 text-right border-b border-slate-200 border-l-2 border-slate-300">Act.</th><th className="px-1 py-1.5 text-center border-b border-slate-200">%</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">Fcst.</th><th className="px-1 py-1.5 text-center border-b border-slate-200">%</th>

                          <th className="px-2 py-1.5 text-right border-b border-slate-200 border-l-2 border-slate-300">Mac</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">iPad</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">Watch</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">ABA</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">3RD</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">SIM</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">Cover+</th>
                          <th className="px-2 py-1.5 text-right border-b border-slate-200">PVL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedData.map((officer, index) => {
                          const iphone18 = officer.iPhone_18 || 0;
                          const adjTotal = calculateActual(officer) - iphone18;
                          const adjIphone = (officer.iPhone || 0) - iphone18;

                          return (
                            <tr key={index} className="hover:bg-rose-50/30 whitespace-nowrap">
                              <td className="px-3 py-2 text-center font-bold text-slate-400">{index + 1}</td>
                              <td className="px-3 py-2 font-bold text-slate-700">{officer.OfficerName}</td>
                              {renderAdjKPI(officer.Target_Total, adjTotal, true)}
                              {renderAdjKPI(officer.Target_iPhone, adjIphone, false)}
                              
                              <td className="px-2 py-2 text-right border-l-2 border-slate-300 text-slate-600">{formatMoney(officer.Mac)}</td>
                              <td className="px-2 py-2 text-right text-slate-600">{formatMoney(officer.iPad)}</td>
                              <td className="px-2 py-2 text-right text-slate-600">{formatMoney(officer['Apple Watch'])}</td>
                              <td className="px-2 py-2 text-right text-slate-600">{formatMoney(officer.ABA)}</td>
                              <td className="px-2 py-2 text-right text-slate-600">{formatMoney(officer['3RD'])}</td>
                              <td className="px-2 py-2 text-right text-slate-600">{formatMoney(officer.Sim)}</td>
                              <td className="px-2 py-2 text-right text-slate-500">{formatMoney(officer['Cover+'])}</td>
                              <td className="px-2 py-2 text-right text-slate-500">{formatMoney(officer.PVL)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-800 text-white font-bold whitespace-nowrap">
                        <tr>
                          <td colSpan="2" className="px-3 py-2.5 text-right text-slate-400 text-[10px] uppercase">Adjusted Total :</td>
                          
                          <td className="px-2 py-2.5 text-right border-l-2 border-slate-600 font-bold text-indigo-300">{formatMoney(storeTotals.Actual_Total - storeTotals.iPhone_18)}</td>
                          <td className="px-1 py-2.5 text-center"><PercentBadge value={storeTotals.Target_Total > 0 ? ((storeTotals.Actual_Total - storeTotals.iPhone_18) / storeTotals.Target_Total) * 100 : 0} /></td>
                          <td className="px-2 py-2.5 text-right font-bold text-indigo-200">{formatMoney(calcForecast(storeTotals.Actual_Total - storeTotals.iPhone_18))}</td>
                          <td className="px-1 py-2.5 text-center"><PercentBadge value={storeTotals.Target_Total > 0 ? (calcForecast(storeTotals.Actual_Total - storeTotals.iPhone_18) / storeTotals.Target_Total) * 100 : 0} /></td>

                          <td className="px-2 py-2.5 text-right border-l-2 border-slate-600 font-bold text-rose-300">{formatMoney(storeTotals.iPhone - storeTotals.iPhone_18)}</td>
                          <td className="px-1 py-2.5 text-center"><PercentBadge value={storeTotals.Target_iPhone > 0 ? ((storeTotals.iPhone - storeTotals.iPhone_18) / storeTotals.Target_iPhone) * 100 : 0} /></td>
                          <td className="px-2 py-2.5 text-right font-bold text-rose-200">{formatMoney(calcForecast(storeTotals.iPhone - storeTotals.iPhone_18))}</td>
                          <td className="px-1 py-2.5 text-center"><PercentBadge value={storeTotals.Target_iPhone > 0 ? (calcForecast(storeTotals.iPhone - storeTotals.iPhone_18) / storeTotals.Target_iPhone) * 100 : 0} /></td>

                          <td className="px-2 py-2.5 text-right border-l-2 border-slate-600 text-slate-300">{formatMoney(storeTotals.Mac)}</td>
                          <td className="px-2 py-2.5 text-right text-slate-300">{formatMoney(storeTotals.iPad)}</td>
                          <td className="px-2 py-2.5 text-right text-slate-300">{formatMoney(storeTotals['Apple Watch'])}</td>
                          <td className="px-2 py-2.5 text-right text-slate-300">{formatMoney(storeTotals.ABA)}</td>
                          <td className="px-2 py-2.5 text-right text-slate-300">{formatMoney(storeTotals['3RD'])}</td>
                          <td className="px-2 py-2.5 text-right text-slate-300">{formatMoney(storeTotals.Sim)}</td>
                          <td className="px-2 py-2.5 text-right text-slate-400">{formatMoney(storeTotals['Cover+'])}</td>
                          <td className="px-2 py-2.5 text-right text-slate-400">{formatMoney(storeTotals.PVL)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default Monthly;