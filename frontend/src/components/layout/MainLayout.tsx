import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/navigation/Navbar';
import Sidebar from '@/components/navigation/Sidebar';

const MainLayout = () => {
  return (
    // Make sure this div is simple
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        {/* --- THIS IS THE FIX --- */}
        {/* Removed ml-64, h-[...], and overflow-y-auto */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;