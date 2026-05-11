import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/**
 * Layout for public routes: Navbar + main outlet, no sidebar.
 */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-(--bg-base)">
      <Navbar variant="public" />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
