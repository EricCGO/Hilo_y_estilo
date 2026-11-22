import { useEffect } from 'react';
import { Outlet } from 'react-router';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import './layouts.css';

export default function AdminLayout() {
  const { isOpen, open, close } = useDisclosure();

  // Evita que la página de detrás se desplace mientras el drawer está abierto.
  useEffect(() => {
    if (!isOpen) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [isOpen]);

  return (
    <div className="admin-shell">
      <div
        className={`admin-overlay ${isOpen ? 'active' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <AdminSidebar isOpen={isOpen} onClose={close} />
      <div className="admin-body">
        <AdminTopbar onOpenMenu={open} menuOpen={isOpen} />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
