import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Sidebar gauche ── */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
      />

      {/* ── Zone droite : Navbar + contenu ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />

        {/* Contenu de la page courante */}
        <main className="flex-1 overflow-y-auto px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}