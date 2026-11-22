import { createBrowserRouter } from 'react-router';

import AdminRoute from './AdminRoute';
import RoleRoute from './RoleRoute';
import ProtectedRoute from './ProtectedRoute';
import { ROLES, ROLES_OPERATIVOS } from '@/shared/utils/constants';
import AdminLayout from '@/layouts/AdminLayout';
import PublicLayout from '@/layouts/PublicLayout';

import HomePage from '@/modules/home/HomePage';
import NotFoundPage from '@/modules/home/NotFoundPage';
import CatalogoPage from '@/modules/catalogo/CatalogoPage';
import ProductoDetallePage from '@/modules/catalogo/ProductoDetallePage';
import ContactoPage from '@/modules/contacto/ContactoPage';
import LoginPage from '@/modules/cuenta/LoginPage';
import RegistroPage from '@/modules/cuenta/RegistroPage';
import CuentaPage from '@/modules/cuenta/CuentaPage';
import MisPedidosPage from '@/modules/pedidos/MisPedidosPage';
import PedidoDetallePage from '@/modules/pedidos/PedidoDetallePage';
import MisEnviosPage from '@/modules/envios/MisEnviosPage';
import DashboardPage from '@/modules/admin/DashboardPage';
import ProductosAdminPage from '@/modules/admin/ProductosAdminPage';
import VentasAdminPage from '@/modules/admin/VentasAdminPage';
import EnviosAdminPage from '@/modules/admin/EnviosAdminPage';
import CategoriasAdminPage from '@/modules/admin/CategoriasAdminPage';
import UsuariosAdminPage from '@/modules/admin/UsuariosAdminPage';

const protegida = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
      { path: 'catalogo/:slug', element: <ProductoDetallePage /> },
      { path: 'contacto', element: <ContactoPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegistroPage /> },
      { path: 'cuenta', element: protegida(<CuentaPage />) },
      { path: 'mis-pedidos', element: protegida(<MisPedidosPage />) },
      { path: 'mis-pedidos/:id', element: protegida(<PedidoDetallePage />) },
      { path: 'envios', element: protegida(<MisEnviosPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <RoleRoute roles={ROLES_OPERATIVOS}><DashboardPage /></RoleRoute> },
      {
        path: 'productos',
        element: (
          <RoleRoute roles={[ROLES.ADMIN, ROLES.INVENTARIO]}>
            <ProductosAdminPage />
          </RoleRoute>
        ),
      },
      {
        path: 'ventas',
        element: (
          <RoleRoute roles={[ROLES.ADMIN, ROLES.VENTAS]}>
            <VentasAdminPage />
          </RoleRoute>
        ),
      },
      {
        path: 'envios',
        element: (
          <RoleRoute roles={[ROLES.ADMIN, ROLES.LOGISTICA]}>
            <EnviosAdminPage />
          </RoleRoute>
        ),
      },
      {
        path: 'categorias',
        element: (
          <RoleRoute roles={[ROLES.ADMIN, ROLES.INVENTARIO]}>
            <CategoriasAdminPage />
          </RoleRoute>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <RoleRoute roles={[ROLES.ADMIN]}>
            <UsuariosAdminPage />
          </RoleRoute>
        ),
      },
    ],
  },
]);

export default router;
