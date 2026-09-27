import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Monthly from './pages/Monthly';
import Admin from './pages/Admin';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Monthly" element={<Monthly />} /> 
            <Route path="/admin" element={<Admin />} /> 
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;