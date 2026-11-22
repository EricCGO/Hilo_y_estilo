export const endpoints = {
  health: '/health/',
  categorias: '/categorias/',
  productos: '/productos/',
  producto: (slug) => `/productos/${slug}/`,
  contacto: '/contacto/',

  register: '/auth/register/',
  login: '/auth/login/',
  logout: '/auth/logout/',
  me: '/auth/me/',

  pedidos: '/pedidos/',
  pedido: (id) => `/pedidos/${id}/`,
  cancelarPedido: (id) => `/pedidos/${id}/cancelar/`,

  envios: '/envios/',
  envio: (id) => `/envios/${id}/`,

  adminDashboard: '/admin/dashboard/',
  adminProductos: '/admin/productos/',
  adminProducto: (id) => `/admin/productos/${id}/`,
  adminProductoStock: (id) => `/admin/productos/${id}/stock/`,
  adminCategorias: '/admin/categorias/',
  adminCategoria: (id) => `/admin/categorias/${id}/`,
  adminUsuarios: '/admin/usuarios/',
  adminUsuario: (id) => `/admin/usuarios/${id}/`,
  adminUsuarioEstado: (id) => `/admin/usuarios/${id}/estado/`,
  adminPedidos: '/admin/pedidos/',
  adminPedidoEstado: (id) => `/admin/pedidos/${id}/estado/`,
  adminEnvios: '/admin/envios/',
  adminEnvio: (id) => `/admin/envios/${id}/`,
};
