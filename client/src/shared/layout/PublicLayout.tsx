import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/**
 * Layout for public routes: Navbar + main outlet, no sidebar.
 */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-(--bg-base) overflow-x-hidden">
      {/* Fix #1: Skip link — first focusable element in the document. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-(--bg-base) focus:px-3 focus:py-1.5 focus:text-sm focus:font-medium focus:text-(--text-primary) focus:ring-2 focus:ring-(--focus-ring) focus:outline-none"
      >
        Aller au contenu
      </a>
      <Navbar variant="public" />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
    </div>
  );
}
