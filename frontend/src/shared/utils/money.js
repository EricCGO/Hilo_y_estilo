const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function money(value) {
  const numero = typeof value === 'number' ? value : Number(value || 0);
  return formatoCOP.format(numero);
}
