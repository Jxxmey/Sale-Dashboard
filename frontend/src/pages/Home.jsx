import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Camera, Calendar as CalendarIcon, XCircle, Trophy, Medal, Award, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const [selectedDate, setSelectedDate] = useState(''); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef(null);

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
    return val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-';
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
    acc.iPhone_18 += curr.iPhone_18 || 0; // 🌟 เก็บยอด iPhone 18 รวมของร้าน
    acc['Apple Watch'] += curr['Apple Watch'] || 0;
    acc['Cover+'] += curr['Cover+'] || 0;
    acc.Sim += curr.Sim || 0;
    acc.ABA += curr.ABA || 0;
    acc['3RD'] += curr['3RD'] || 0;
    acc.PVL += curr.PVL || 0;
    acc['UFUND PERSONAL'] += curr['UFUND PERSONAL'] || 0;
    acc.RowTotal += calculateRowTotal(curr);
    return acc;
  }, {
    Mac: 0, iPad: 0, iPhone: 0, iPhone_18: 0, 'Apple Watch': 0, 'Cover+': 0, Sim: 0, ABA: 0, '3RD': 0, PVL: 0, 'UFUND PERSONAL': 0, RowTotal: 0
  });

  const getAvatarColor = (name) => {
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const RankIcon = ({ rank }) => {
    if (rank === 1) return <div className="flex justify-center"><Trophy className="text-yellow-500 drop-shadow-sm" size={18} fill="currentColor" /></div>;
    if (rank === 2) return <div className="flex justify-center"><Medal className="text-slate-400 drop-shadow-sm" size={18} fill="currentColor" /></div>;
    if (rank === 3) return <div className="flex justify-center"><Award className="text-amber-700 drop-shadow-sm" size={18} fill="currentColor" /></div>;
    return <div className="text-center font-bold text-slate-400 text-xs">{rank}</div>;
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
          alert("✅ คัดลอกรูปภาพเรียบร้อยแล้ว!\nสามารถนำไป Paste (Ctrl+V) ในแชทได้เลยครับ");
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
          <h1 className="text-3xl font-black text-indigo-700 mb-1">Daily Leaderboard</h1>
          <p className="text-sm text-slate-500 font-medium">สรุปยอดขายรายวัน พร้อมระบบจัดอันดับและปรับหักลบ iPhone 18</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1 px-2">
            <CalendarIcon size={16} className="text-indigo-500 mr-1" />
            <input 
              type="date" 
              className="p-1 text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="text-slate-400 hover:text-rose-500 ml-1">
                <XCircle size={16} />
              </button>
            )}
          </div>

          <button 
            onClick={handleCapture}
            disabled={isCapturing || sortedData.length === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all ${
              isCapturing || sortedData.length === 0
                ? 'bg-slate-200 text-slate-400'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <Camera size={16} />
            {isCapturing ? 'กำลังประมวลผล...' : 'คัดลอกรูปภาพ (Copy)'}
          </button>
        </div>
      </div>

      {/* 🌟 กล่องใหญ่ครอบทั้งหมดสำหรับแคปรูป */}
      <div ref={captureRef} className="p-4 -m-4 bg-slate-50 rounded-2xl">
        {selectedDate ? (
          <div className="mb-4 flex justify-center">
            <div className="px-4 py-1.5 bg-white border border-indigo-100 rounded-full shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-indigo-900 text-xs font-bold">ข้อมูลประจำวันที่: {selectedDate}</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex justify-center">
            <div className="px-4 py-1.5 bg-white border border-indigo-100 rounded-full shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-indigo-900 text-xs font-bold">ข้อมูลยอดขายรวม (ทั้งหมดที่ยังไม่กรองวันที่)</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* 1. ตารางยอดขายปกติ (Main Table) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-max">
                  <thead>
                    <tr>
                      <th colSpan="3" className="bg-white"></th>
                      <th className="text-center py-1.5 text-[10px] font-bold text-white bg-indigo-600 border-b-2 border-indigo-700">🏆 ยอดรวมทั้งหมด (Total)</th>
                      <th colSpan="4" className="text-center py-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border-b-2 border-indigo-100 border-l border-white">🍎 Apple Core</th>
                      <th colSpan="2" className="text-center py-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 border-b-2 border-teal-100 border-l border-white">🎧 Accessories</th>
                      <th colSpan="3" className="text-center py-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border-b-2 border-amber-100 border-l border-white">📱 Services</th>
                      <th colSpan="1" className="text-center py-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 border-b-2 border-rose-100 border-l border-white">🎓 Special</th>
                    </tr>
                    <tr className="text-[11px] text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-3 text-center font-bold">Rank</th>
                      <th className="px-3 py-3 font-bold">พนักงาน</th>
                      <th className="px-2 py-3 font-bold">รหัส</th>
                      
                      <th className="px-4 py-3 text-right text-indigo-700 font-bold border-l border-slate-200">Total Sales</th>
                      
                      <th className="px-3 py-3 text-right font-bold border-l border-slate-200">Mac</th>
                      <th className="px-3 py-3 text-right font-bold">iPad</th>
                      <th className="px-3 py-3 text-right font-bold">iPhone</th>
                      <th className="px-3 py-3 text-right font-bold">Watch</th>
                      
                      <th className="px-3 py-3 text-right font-bold border-l border-slate-200">ABA</th>
                      <th className="px-3 py-3 text-right font-bold">3RD</th>
                      
                      <th className="px-3 py-3 text-right font-bold border-l border-slate-200">Cover+</th>
                      <th className="px-3 py-3 text-right font-bold">Sim</th>
                      <th className="px-3 py-3 text-right font-bold">PVL</th>
                      
                      <th className="px-4 py-3 text-center font-bold border-l border-slate-200">UFUND</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100">
                    {sortedData.map((officer, index) => {
                      const total = calculateRowTotal(officer);
                      const avatarColor = getAvatarColor(officer.OfficerName);
                      return (
                        <tr key={index} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                          <td className="px-3 py-2 align-middle"><RankIcon rank={index + 1} /></td>
                          <td className="px-3 py-2 flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${avatarColor}`}>{officer.OfficerName.charAt(0)}</div>
                            <span className="font-bold text-slate-700">{officer.OfficerName}</span>
                          </td>
                          <td className="px-2 py-2 text-[10px] text-slate-400">{officer.OfficerID}</td>
                          
                          <td className="px-4 py-2 text-right font-bold text-indigo-600 bg-indigo-50/30 border-l border-slate-100">{formatMoney(total)}</td>
                          
                          <td className="px-3 py-2 text-right text-slate-600 border-l border-slate-100">{formatMoney(officer.Mac)}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{formatMoney(officer.iPad)}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{formatMoney(officer.iPhone)}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{formatMoney(officer['Apple Watch'])}</td>
                          
                          <td className="px-3 py-2 text-right text-slate-600 border-l border-slate-100">{formatMoney(officer.ABA)}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{formatMoney(officer['3RD'])}</td>
                          
                          <td className="px-3 py-2 text-right text-slate-500 border-l border-slate-100">{formatMoney(officer['Cover+'])}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{formatMoney(officer.Sim)}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{formatMoney(officer.PVL)}</td>
                          
                          <td className="px-4 py-2 text-center font-bold text-rose-500 border-l border-slate-100 bg-rose-50/20">{officer['UFUND PERSONAL']}</td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {sortedData.length > 0 && (
                    <tfoot className="bg-slate-800 text-white font-bold whitespace-nowrap">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right text-slate-400 text-[10px] uppercase">Total Store :</td>
                        <td className="px-4 py-3 text-right text-blue-300 text-sm border-l border-slate-700 bg-white/5">{formatMoney(storeTotals.RowTotal)}</td>
                        <td className="px-3 py-3 text-right border-l border-slate-700 text-indigo-200">{formatMoney(storeTotals.Mac)}</td>
                        <td className="px-3 py-3 text-right text-indigo-200">{formatMoney(storeTotals.iPad)}</td>
                        <td className="px-3 py-3 text-right text-indigo-200">{formatMoney(storeTotals.iPhone)}</td>
                        <td className="px-3 py-3 text-right text-indigo-200">{formatMoney(storeTotals['Apple Watch'])}</td>
                        <td className="px-3 py-3 text-right border-l border-slate-700 text-teal-200">{formatMoney(storeTotals.ABA)}</td>
                        <td className="px-3 py-3 text-right text-teal-200">{formatMoney(storeTotals['3RD'])}</td>
                        <td className="px-3 py-3 text-right border-l border-slate-700 text-amber-200/70">{formatMoney(storeTotals['Cover+'])}</td>
                        <td className="px-3 py-3 text-right text-amber-200/70">{formatMoney(storeTotals.Sim)}</td>
                        <td className="px-3 py-3 text-right text-amber-200/70">{formatMoney(storeTotals.PVL)}</td>
                        <td className="px-4 py-3 text-center border-l border-slate-700 text-rose-300 bg-rose-900/30">{storeTotals['UFUND PERSONAL']}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* 🌟 2. ตารางพิเศษด้านล่าง: หักลบ iPhone 18 */}
            {sortedData.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border-2 border-rose-100 overflow-hidden">
                <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-2">
                  <AlertCircle size={20} className="text-rose-500" />
                  <div>
                    <h2 className="text-sm font-black text-rose-700">ตารางสรุปยอดขาย (ไม่รวมยอดขาย iPhone 18 Pro / Pro Max)</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">คอลัมน์ "Adjusted Total" และ "Adjusted iPhone" ถูกหักลบยอดขายของ iPhone 18 Pro/Pro Max ออกไปแล้ว</p>
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
                        <th className="px-3 py-2 text-center font-bold">Rank</th>
                        <th className="px-3 py-2 font-bold">พนักงาน</th>
                        
                        <th className="px-4 py-2 text-right font-bold border-l border-slate-200">Adj. Total Sales</th>
                        <th className="px-4 py-2 text-right font-bold border-l border-slate-200">Adj. iPhone</th>
                        
                        <th className="px-3 py-2 text-right font-bold border-l border-slate-200">Mac</th>
                        <th className="px-3 py-2 text-right font-bold">iPad</th>
                        <th className="px-3 py-2 text-right font-bold">Watch</th>
                        <th className="px-3 py-2 text-right font-bold">ABA</th>
                        <th className="px-3 py-2 text-right font-bold">3RD</th>
                        <th className="px-3 py-2 text-right font-bold">Cover+</th>
                        <th className="px-3 py-2 text-right font-bold">Sim</th>
                        <th className="px-3 py-2 text-right font-bold">PVL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedData.map((officer, index) => {
                        const iphone18 = officer.iPhone_18 || 0;
                        const adjTotal = calculateRowTotal(officer) - iphone18;
                        const adjIphone = (officer.iPhone || 0) - iphone18;

                        return (
                          <tr key={index} className="hover:bg-rose-50/40 transition-colors whitespace-nowrap">
                            <td className="px-3 py-2 text-center font-bold text-slate-400">{index + 1}</td>
                            <td className="px-3 py-2 font-bold text-slate-700">{officer.OfficerName}</td>
                            
                            {/* Adjusted Columns */}
                            <td className="px-4 py-2 text-right font-bold text-indigo-700 bg-indigo-50/50 border-l border-slate-100">{formatMoney(adjTotal)}</td>
                            <td className="px-4 py-2 text-right font-bold text-rose-700 bg-rose-50/50 border-l border-slate-100">{formatMoney(adjIphone)}</td>
                            
                            {/* Normal Columns */}
                            <td className="px-3 py-2 text-right text-slate-600 border-l border-slate-100">{formatMoney(officer.Mac)}</td>
                            <td className="px-3 py-2 text-right text-slate-600">{formatMoney(officer.iPad)}</td>
                            <td className="px-3 py-2 text-right text-slate-600">{formatMoney(officer['Apple Watch'])}</td>
                            <td className="px-3 py-2 text-right text-slate-600">{formatMoney(officer.ABA)}</td>
                            <td className="px-3 py-2 text-right text-slate-600">{formatMoney(officer['3RD'])}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{formatMoney(officer['Cover+'])}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{formatMoney(officer.Sim)}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{formatMoney(officer.PVL)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-800 text-white font-bold whitespace-nowrap">
                      <tr>
                        <td colSpan="2" className="px-3 py-3 text-right text-slate-400 text-[10px] uppercase">Adjusted Total Store :</td>
                        
                        <td className="px-4 py-3 text-right text-indigo-300 font-bold border-l border-slate-700 bg-indigo-900/30">{formatMoney(storeTotals.RowTotal - storeTotals.iPhone_18)}</td>
                        <td className="px-4 py-3 text-right text-rose-300 font-bold border-l border-slate-700 bg-rose-900/30">{formatMoney(storeTotals.iPhone - storeTotals.iPhone_18)}</td>
                        
                        <td className="px-3 py-3 text-right text-slate-300 border-l border-slate-700">{formatMoney(storeTotals.Mac)}</td>
                        <td className="px-3 py-3 text-right text-slate-300">{formatMoney(storeTotals.iPad)}</td>
                        <td className="px-3 py-3 text-right text-slate-300">{formatMoney(storeTotals['Apple Watch'])}</td>
                        <td className="px-3 py-3 text-right text-slate-300">{formatMoney(storeTotals.ABA)}</td>
                        <td className="px-3 py-3 text-right text-slate-300">{formatMoney(storeTotals['3RD'])}</td>
                        <td className="px-3 py-3 text-right text-slate-400">{formatMoney(storeTotals['Cover+'])}</td>
                        <td className="px-3 py-3 text-right text-slate-400">{formatMoney(storeTotals.Sim)}</td>
                        <td className="px-3 py-3 text-right text-slate-400">{formatMoney(storeTotals.PVL)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default Home;