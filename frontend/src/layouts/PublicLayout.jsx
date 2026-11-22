import { Outlet } from 'react-router';
import Encabezado from './components/Encabezado';
import Sidebar from './components/Sidebar';
import Piepagina from './components/Piepagina';
import CarritoDrawer from '@/modules/pedidos/CarritoDrawer';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import './layouts.css';

export default function PublicLayout() {
  const { isOpen, open, close } = useDisclosure();

  return (
    <div className="app-shell">
      <Encabezado onOpenSidebar={open} />
      <Sidebar isOpen={isOpen} onClose={close} />
      <CarritoDrawer />
      <main className="public-main">
        <Outlet />
      </main>
      <Piepagina />
    </div>
  );
}
