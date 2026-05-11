import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

/**
 * Layout for protected app routes: Navbar + Sidebar (drawer mobile,
 * persistent desktop) + main outlet.
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-(--bg-base)">
      <Navbar variant="app" onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main id="main" className="flex-1 overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
