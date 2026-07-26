import { apiUrl } from '@/utils/api';

/**
 * Generic POST request wrapper
 * @param {string} endpoint - The API endpoint relative to base URL (e.g. '/api/load-data')
 * @param {object} payload - The body to send
 * @returns {Promise<any>}
 */
async function postData(endpoint, payload) {
  try {
    const response = await fetch(apiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Attempt to parse JSON regardless of status
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error en API call a ${endpoint}:`, error);
    throw error;
  }
}

export const apiService = {
  /**
   * Cargar datos desde la base de datos dinámica
   */
  async loadData(engine, connectionData, model) {
    return postData('/api/load-data', { engine, connectionData, model });
  },

  /**
   * Sincronizar (UPSERT/DELETE) datos hacia la BD
   */
  async syncData(engine, connectionData, payload) {
    return postData('/api/sync-data', { engine, connectionData, payload });
  },

  /**
   * Testear conexión de base de datos
   */
  async testConnection(engine, connectionData) {
    return postData('/api/test-connection', { engine, connectionData });
  },

  /**
   * Inicializar/crear tablas en base de datos
   */
  async initDatabase(engine, connectionData) {
    return postData('/api/init-db', { engine, connectionData });
  }
};
