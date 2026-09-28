import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Camera, Star, ChevronDown, ChevronUp, Building2, Tag, Trophy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function PerformancePC() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [expanded, setExpanded] = useState({}); 
  
  const captureRef = useRef(null);

  useEffect(() => {
    fetchPCSummary();
  }, []);

  const fetchPCSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/summary/pc/thismonth`);
      
      const grouped = res.data.reduce((acc, curr) => {
        const comp = curr.Company;
        if (!acc[comp]) acc[comp] = { name: comp, total: 0, brands: [] };
        acc[comp].brands.push({ name: curr.Brand, sales: curr.Sales });
        acc[comp].total += curr.Sales;
        return acc;
      }, {});

      const sortedCompanies = Object.values(grouped).sort((a, b) => b.total - a.total);
      sortedCompanies.forEach(c => c.brands.sort((a, b) => b.sales - a.sales));

      setData(sortedCompanies);
    } catch (error) {
      console.error("Error fetching PC data:", error);
    }
    setLoading(false);
  };

  const formatMoney = (num) => {
    const val = Number(num);
    return val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0';
  };

  const toggleExpand = (compName) => {
    setExpanded(prev => ({ ...prev, [compName]: !prev[compName] }));
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
          const details = clonedDoc.querySelectorAll('.brand-details');
          details.forEach(el => {
            el.style.display = 'block';
            el.classList.remove('hidden');
          });
          const chevrons = clonedDoc.querySelectorAll('.chevron-icon');
          chevrons.forEach(el => el.style.display = 'none');
        }
      });
      
      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          alert("✅ คัดลอกรูปภาพเรียบร้อยแล้ว!\nระบบได้กางข้อมูลรายแบรนด์ให้ทั้งหมดก่อนแคปรูป สามารถ Paste ส่งได้เลยครับ");
        } catch (err) {
          alert("❌ คัดลอกไม่สำเร็จ เบราว์เซอร์อาจไม่รองรับ");
        } finally { setIsCapturing(false); }
      }, "image/png");
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
      setIsCapturing(false);
    }
  };

  // 🌟 เพิ่มค่าย RTB และธีมสีที่นี่
  const themes = {
    'Maitreechit': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', grad: 'from-sky-500 to-blue-500', icon: 'text-sky-500' },
    'DPLUS Together': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', grad: 'from-indigo-500 to-purple-500', icon: 'text-indigo-500' },
    'PVL': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', grad: 'from-teal-400 to-emerald-500', icon: 'text-teal-500' },
    'RTB': { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', grad: 'from-fuchsia-500 to-purple-600', icon: 'text-fuchsia-500' }
  };

  const storeTotalPC = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="pb-10 font-sans max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-amber-600 mb-2 flex items-center gap-2 tracking-tight">
            <Star size={32} className="text-amber-500" fill="currentColor" />
            Performance PC
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">สรุปยอดขายรายบริษัท (คลิกเพื่อดูรายชื่อแบรนด์)</p>
        </div>
        
        <button 
          onClick={handleCapture}
          disabled={isCapturing || data.length === 0}
          className={`flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all ${
            isCapturing || data.length === 0
              ? 'bg-slate-200 text-slate-400'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-lg'
          }`}
        >
          <Camera size={18} />
          {isCapturing ? 'กำลังประมวลผล...' : 'คัดลอกรูปรวมทั้งหมด (Copy)'}
        </button>
      </div>

      <div ref={captureRef} className="p-2 sm:p-4 -mx-2 sm:-mx-4 bg-slate-50 rounded-3xl">
        
        <div className="mb-6 flex justify-center">
          <div className="px-6 py-2 bg-white border border-amber-200 rounded-full shadow-sm flex items-center gap-2">
            <Star size={16} className="text-amber-500" fill="currentColor" />
            <span className="text-amber-900 text-sm font-black uppercase tracking-widest">Total PC Brand Sales</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-100 border-t-amber-500"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6">
            
            {data.length > 0 && (
              <div className="bg-slate-900 rounded-3xl shadow-lg border border-slate-700 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-wide">ยอดขายรวม PC ทั้งหมด</h2>
                    <p className="text-sm text-slate-400">จาก 4 บริษัทหลัก</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Store</p>
                  <p className="text-3xl font-black text-amber-400">
                    {formatMoney(storeTotalPC)}
                  </p>
                </div>
              </div>
            )}

            {data.map((comp, index) => {
              const t = themes[comp.name] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', grad: 'from-slate-500 to-slate-600', icon: 'text-slate-500' };
              const isExpanded = expanded[comp.name];

              return (
                <div key={comp.name} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                  
                  <div 
                    onClick={() => toggleExpand(comp.name)} 
                    className={`p-5 sm:p-6 flex justify-between items-center cursor-pointer transition-colors ${t.bg}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${t.grad} shadow-lg z-10 relative`}>
                          <Building2 size={28} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm font-black text-[10px] text-slate-600 border border-slate-100 z-20">
                          #{index + 1}
                        </div>
                      </div>
                      <div>
                        <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${t.text}`}>{comp.name}</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1">รวม {comp.brands.length} แบรนด์</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Company Total</p>
                        <p className={`text-2xl font-black ${t.text}`}>{formatMoney(comp.total)}</p>
                      </div>
                      <div className="chevron-icon w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-slate-500 shadow-sm border border-white">
                         {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`sm:hidden px-5 py-4 border-b border-white ${t.bg}`}>
                     <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl">
                        <span className="text-xs font-bold text-slate-500">Company Total</span>
                        <span className={`text-xl font-black ${t.text}`}>{formatMoney(comp.total)}</span>
                     </div>
                  </div>

                  <div className={`brand-details transition-all duration-300 origin-top ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="p-5 sm:p-6 bg-white flex flex-col gap-3">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Tag size={14} /> รายละเอียดแบรนด์ (เรียงตามยอดขาย)
                       </h3>
                       {comp.brands.map((b) => (
                         <div key={b.name} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <span className="font-bold text-slate-700 text-sm sm:text-base">{b.name}</span>
                            <span className="font-black text-slate-800 text-lg sm:text-xl">{formatMoney(b.sales)}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                </div>
              );
            })}

            {data.length === 0 && (
              <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
                <Star size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-lg font-bold text-slate-400">ไม่มีข้อมูลยอดขาย PC</p>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformancePC;