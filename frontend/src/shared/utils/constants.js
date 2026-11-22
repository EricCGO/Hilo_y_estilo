export const ROLES = {
  CLIENTE: 'cliente',
  ADMIN: 'admin_general',
  INVENTARIO: 'operador_inventario',
  LOGISTICA: 'operador_logistica',
  VENTAS: 'operador_ventas',
};

export const ROLES_LABELS = {
  [ROLES.CLIENTE]: 'Cliente',
  [ROLES.ADMIN]: 'Administrador general',
  [ROLES.INVENTARIO]: 'Operador de inventario',
  [ROLES.LOGISTICA]: 'Operador de logística',
  [ROLES.VENTAS]: 'Operador de ventas',
};

/** Roles con acceso al panel /admin. El cliente nunca entra aquí. */
export const ROLES_OPERATIVOS = [
  ROLES.ADMIN,
  ROLES.INVENTARIO,
  ROLES.LOGISTICA,
  ROLES.VENTAS,
];

/** Roles asignables a empleados desde el panel (excluye cliente). */
export const ROLES_EMPLEADO = [
  ROLES.ADMIN,
  ROLES.INVENTARIO,
  ROLES.LOGISTICA,
  ROLES.VENTAS,
];

export const ESTADOS_PEDIDO = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  confirmado: { label: 'Confirmado', tone: 'info' },
  en_preparacion: { label: 'En preparación', tone: 'info' },
  enviado: { label: 'Enviado', tone: 'success' },
  entregado: { label: 'Entregado', tone: 'success' },
  cancelado: { label: 'Cancelado', tone: 'danger' },
};

export const TRANSICIONES_PEDIDO = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['en_preparacion', 'cancelado'],
  en_preparacion: ['enviado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
};

export const ESTADOS_ENVIO = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  en_transito: 'En tránsito',
  entregado: 'Entregado',
  devuelto: 'Devuelto',
};

export const TRANSICIONES_ENVIO = {
  pendiente: ['preparando', 'en_transito'],
  preparando: ['en_transito'],
  en_transito: ['entregado', 'devuelto'],
  entregado: [],
  devuelto: [],
};
