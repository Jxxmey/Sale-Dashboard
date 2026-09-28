import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Monthly from './pages/Monthly';
import Admin from './pages/Admin';
import Calculator from './pages/Calculator';
import PerformancePC from './pages/PerformancePC';
import StoreReport from './pages/StoreReport'; // 🌟 1. นำเข้าไฟล์ใหม่

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans pb-20 md:pb-0"> 
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/performance" element={<PerformancePC />} />
            <Route path="/report" element={<StoreReport />} /> {/* 🌟 2. เพิ่ม Route ใหม่ */}
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;