/**
 * Cliente HTTP centralizado.
 * - Usa cookies httpOnly (credentials: 'include'), sin guardar tokens en localStorage.
 * - Normaliza errores y reintenta una vez tras refrescar el JWT en 401.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshingPromise = null;

function refreshSession() {
  if (!refreshingPromise) {
    refreshingPromise = fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshingPromise = null;
      });
  }
  return refreshingPromise;
}

async function parseBody(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url;
}

export async function request(method, path, { body, params, _retry = false } = {}) {
  const headers = { Accept: 'application/json' };
  let payload;

  if (body !== undefined) {
    if (body instanceof FormData) {
      payload = body;
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }

  let response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      credentials: 'include',
      body: payload,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', {
      code: 'RED_NO_DISPONIBLE',
    });
  }

  if (response.status === 401 && !_retry && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request(method, path, { body, params, _retry: true });
    }
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  const data = await parseBody(response);
  if (!response.ok) {
    const error = data?.error || {};
    throw new ApiError(error.message || 'La solicitud no se pudo completar.', {
      status: response.status,
      code: error.code || 'ERROR_INTERNO',
      details: error.details,
    });
  }

  return data;
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
};

export default api;
