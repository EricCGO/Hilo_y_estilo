/** Convierte el envelope { error: { code, message, details } } en errores de formulario. */
export function interpretarError(error) {
  const detalles = error?.details;
  const campos = {};
  let general = '';

  if (Array.isArray(detalles)) {
    general = detalles.map((item) => String(item)).join(' ');
  } else if (detalles && typeof detalles === 'object') {
    Object.entries(detalles).forEach(([clave, valor]) => {
      const texto = Array.isArray(valor) ? valor.join(' ') : String(valor);
      if (clave === 'detail' || clave === 'non_field_errors') general = texto;
      else campos[clave] = texto;
    });
  }

  if (!general && Object.keys(campos).length === 0) {
    general = error?.message || 'No se pudo completar la solicitud.';
  }

  return { campos, general };
}
