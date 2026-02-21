import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-deep-navy">
      <Sidebar />
      <main
        style={{ marginLeft: '248px' }}
        className="flex-1 min-h-screen overflow-auto"
      >
        <Outlet />
      </main>
    </div>
  );
}
