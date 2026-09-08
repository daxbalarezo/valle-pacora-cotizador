/**
 * Cliente API HTTP para el Cotizador Valle Pacora
 * Se comunica con el servidor Node.js + Express (/api)
 */

const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.error || `Error HTTP ${response.status}: ${response.statusText}`);
    }

    return result?.data !== undefined ? result.data : result;
  } catch (err) {
    console.warn(`[API Error] en ${options.method || 'GET'} ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Proformas
  getProformas: () => request('/proformas'),
  getProformaById: (id) => request(`/proformas/${id}`),
  getProformaByToken: (token) => request(`/proformas/token/${token}`),
  createProforma: (data) => request('/proformas', { method: 'POST', body: JSON.stringify(data) }),
  updateProforma: (id, data) => request(`/proformas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateProformaStatus: (id, status) => request(`/proformas/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  duplicateProforma: (id) => request(`/proformas/${id}/duplicate`, { method: 'POST' }),
  deleteProforma: (id) => request(`/proformas/${id}`, { method: 'DELETE' }),

  // Clientes
  getClients: () => request('/clients'),
  getClientById: (id) => request(`/clients/${id}`),
  createClient: (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: 'DELETE' }),

  // Plantillas
  getTemplates: () => request('/templates'),
  createTemplate: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: 'DELETE' }),

  // Catálogo de Parcelas
  getProperties: () => request('/properties'),

  // Configuración
  getConfig: () => request('/config'),
  updateConfig: (data) => request('/config', { method: 'PUT', body: JSON.stringify(data) }),

  // Autenticación
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
};
