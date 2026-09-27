import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Target() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/targets`);
      setTargets(res.data);
    } catch (error) {
      console.error("Error fetching targets:", error);
    }
    setLoading(false);
  };

  const handleTargetChange = (index, value) => {
    const newTargets = [...targets];
    // ลบตัวอักษรที่ไม่ใช่ตัวเลขออก แล้วอัปเดต state
    newTargets[index].Target = Number(value.replace(/[^0-9.-]+/g, ""));
    setTargets(newTargets);
  };

  const saveTargets = async () => {
    setSaving(true);
    try {
      const payload = {
        targets: targets.map(t => ({
          OfficerID: t.OfficerID,
          Target: t.Target || 0
        }))
      };
      await axios.post(`${API_URL}/targets`, payload);
      alert('บันทึกเป้าหมาย (Target) สำเร็จ!');
    } catch (error) {
      console.error("Error saving targets:", error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">ตั้งเป้าหมาย (Target) พนักงาน PIA</h1>
        <button 
          onClick={saveTargets}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-500">กำลังโหลดข้อมูลพนักงาน...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 w-1/4">รหัสพนักงาน</th>
                <th className="px-6 py-4 w-2/4">ชื่อพนักงาน</th>
                <th className="px-6 py-4 w-1/4 text-right">Target (ยอดขาย)</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((officer, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{officer.OfficerID}</td>
                  <td className="px-6 py-4 font-medium text-gray-700">{officer.OfficerName}</td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="text"
                      className="w-full text-right p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      value={officer.Target > 0 ? officer.Target.toLocaleString() : ''}
                      placeholder="0"
                      onChange={(e) => handleTargetChange(index, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              {targets.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500">
                    ไม่พบข้อมูลพนักงานตำแหน่ง PIA (กรุณาอัปเดตไฟล์ employee.csv)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Target;