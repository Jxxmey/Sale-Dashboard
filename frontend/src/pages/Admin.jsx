import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  // State สำหรับระบบล็อคอิน
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // State สำหรับอัปโหลดข้อมูล
  const [period, setPeriod] = useState('thismonth');
  const [textData, setTextData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // 🔒 เปลี่ยนรหัสผ่านที่คุณต้องการได้ที่นี่
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
    try {
      const blob = new Blob([textData], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', blob, `${period}.csv`);

      await axios.post(`${API_URL}/upload/${period}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('อัปเดตข้อมูลสำเร็จ!');
      setTextData(''); 
    } catch (error) {
      console.error("Upload error:", error);
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
    setLoading(false);
  };

  // ------------------------------------------------------------------
  // 1. หน้าจอใส่รหัสผ่าน (แสดงผลเมื่อยังไม่ได้ล็อกอิน)
  // ------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">เข้าสู่ระบบ Admin</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรุณาใส่รหัสผ่าน..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {loginError && <p className="text-red-500 text-sm mt-2 font-medium">รหัสผ่านไม่ถูกต้อง!</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            ยืนยัน
          </button>
        </form>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 2. หน้าจอจัดการระบบ (แสดงผลเมื่อรหัสผ่านถูกต้อง)
  // ------------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการระบบ (Admin)</h1>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-sm text-red-600 hover:text-red-800 font-medium bg-red-50 px-4 py-2 rounded-lg"
        >
          ออกจากระบบ
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-gray-800">อัปเดตข้อมูลระบบ</h2>
          <select 
            className="p-2 border border-gray-300 rounded-lg bg-white shadow-sm font-medium focus:ring-blue-500 focus:border-blue-500"
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="thismonth">ยอดขายเดือนนี้ (This Month)</option>
            <option value="lastmonth">ยอดขายเดือนที่แล้ว (Last Month)</option>
            <option value="lastyear">ยอดขายปีที่แล้ว (Last Year)</option>
            <option value="target">ข้อมูลเป้าหมาย (Target)</option>
          </select>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">คัดลอกข้อมูลตารางจาก Excel (คลุมดำตั้งแต่ Header) แล้ววางลงในช่องนี้</p>
        
        <textarea
          className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm mb-4 whitespace-pre"
          placeholder="วางข้อมูลลงที่นี่..."
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
        ></textarea>
        
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>
    </div>
  );
}

export default Admin;