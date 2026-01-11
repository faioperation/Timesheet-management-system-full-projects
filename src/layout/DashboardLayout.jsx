import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <section className="w-full h-[80px] fixed top-0 z-40 bg-white">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </section>

      {/* Sidebar + Content */}
      <div className="flex items-center justify-between w-screen h-[calc(100vh-80px)] mt-[80px]">
        {/* Sidebar - Desktop: Always visible, Mobile: Drawer */}
        <div
          className={`lg:w-[5%] w-[70px] h-full transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:relative z-30 top-[80px] lg:top-0`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden top-[80px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <div className="w-full lg:w-[95%] px-4 sm:px-6 md:px-8 lg:px-12 pt-4 sm:pt-6 md:pt-8 lg:pt-12 bg-[#F0F0F2] h-full overflow-y-scroll hide-scrollbar">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;

