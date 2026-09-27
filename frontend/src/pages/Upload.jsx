import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Upload() {
  const [period, setPeriod] = useState('thismonth');
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveData = async () => {
    if (!csvText.trim()) {
      alert("กรุณาวางข้อมูล CSV ลงในช่องว่างก่อนกดบันทึก");
      return;
    }

    setLoading(true);
    try {
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const formData = new FormData();
      formData.append('file', blob, `${period}_upload.csv`);

      const response = await axios.post(`${API_URL}/upload/${period}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        alert(`อัปเดตข้อมูลรอบ ${period} สำเร็จ! ข้อมูลใหม่พร้อมใช้งานแล้ว`);
        setCsvText(''); 
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดตรวจสอบรูปแบบข้อมูล");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">อัปเดตข้อมูลยอดขาย</h1>
        <p className="text-gray-500">เลือกช่วงเวลา และวางข้อมูลดิบ (CSV) เพื่อแทนที่ข้อมูลเดิมในระบบ</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <label className="font-semibold text-gray-700">อัปเดตข้อมูลของ:</label>
          <select 
            className="p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="thismonth">เดือนนี้ (This Month)</option>
            <option value="lastmonth">เดือนที่แล้ว (Last Month)</option>
            <option value="lastyear">ปีที่แล้ว (Last Year)</option>
            <option value="target">ข้อมูลเป้าหมายพนักงาน (Target)</option>
          </select>
        </div>

        <textarea
          className="w-full h-[400px] p-4 border border-gray-300 rounded-lg font-mono text-sm whitespace-pre overflow-x-auto focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          placeholder="วางข้อมูลจากแอปพลิเคชันของคุณที่นี่..."
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          disabled={loading}
        ></textarea>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSaveData}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'กำลังบันทึกและเขียนทับ...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;