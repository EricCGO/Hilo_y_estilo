export function dateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function dateOnly(value) {
  if (!value) return '—';
  // Los campos DATE de Django llegan como "YYYY-MM-DD"; añadir hora local
  // evita que se interpreten como UTC y se muestre el día anterior.
  const texto = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(
    new Date(texto)
  );
}
