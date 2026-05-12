import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

/**
 * Layout for protected app routes: Navbar + Sidebar (drawer mobile,
 * persistent desktop) + main outlet.
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  function handleClose() {
    setSidebarOpen(false);
    // Restore focus to the hamburger trigger when drawer closes.
    hamburgerRef.current?.focus();
  }

  return (
    <div className="flex min-h-screen flex-col bg-(--bg-base)">
      {/* Fix #1: Skip link — first focusable element in the document. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-(--bg-base) focus:px-3 focus:py-1.5 focus:text-sm focus:font-medium focus:text-(--text-primary) focus:ring-2 focus:ring-(--focus-ring) focus:outline-none"
      >
        Aller au contenu
      </a>
      <Navbar
        variant="app"
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        hamburgerRef={hamburgerRef}
      />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={handleClose} />
        {/* Fix #3: inert on <main> when sidebar drawer is open (mobile) */}
        <main
          id="main"
          tabIndex={-1}
          className="flex-1 overflow-x-hidden p-6 focus:outline-none"
          {...(sidebarOpen ? { inert: true } : {})}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
