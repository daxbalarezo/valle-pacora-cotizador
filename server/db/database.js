import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  SEED_PROPERTIES, 
  SEED_PROFORMAS, 
  SEED_CLIENTS, 
  SEED_TEMPLATES, 
  SEED_CONFIG 
} from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp' : path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'valle_pacora_db.json');
const BUNDLED_DB_FILE = path.resolve(__dirname, '../data/valle_pacora_db.json');

class Database {
  constructor() {
    this.data = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const fileExists = await fs.access(DB_FILE).then(() => true).catch(() => false);

      if (fileExists) {
        const raw = await fs.readFile(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('[Database] Base de datos cargada desde:', DB_FILE);
      } else {
        // Intentar leer de archivo empaquetado si existe
        let baseData = null;
        try {
          const bundledRaw = await fs.readFile(BUNDLED_DB_FILE, 'utf-8');
          baseData = JSON.parse(bundledRaw);
        } catch {
          baseData = {
            properties: SEED_PROPERTIES,
            proformas: SEED_PROFORMAS,
            clients: SEED_CLIENTS,
            templates: SEED_TEMPLATES,
            config: SEED_CONFIG
          };
        }
        this.data = baseData;
        await this.persist();
        console.log('[Database] Base de datos inicializada en:', DB_FILE);
      }
      this.initialized = true;
    } catch (err) {
      console.error('[Database] Error al inicializar base de datos:', err);
      // Fallback en memoria
      this.data = {
        properties: SEED_PROPERTIES,
        proformas: SEED_PROFORMAS,
        clients: SEED_CLIENTS,
        templates: SEED_TEMPLATES,
        config: SEED_CONFIG
      };
      this.initialized = true;
    }
  }

  async persist() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      const jsonContent = JSON.stringify(this.data, null, 2);
      await fs.writeFile(tempFile, jsonContent, 'utf-8');
      await fs.rename(tempFile, DB_FILE);
    } catch (err) {
      console.error('[Database] Error al persistir cambios en disco:', err);
    }
  }

  // --- PROFORMAS ---
  async getProformas() {
    await this.init();
    return this.data.proformas || [];
  }

  async getProformaById(id) {
    await this.init();
    return (this.data.proformas || []).find(p => p.id === id || p.code === id) || null;
  }

  async getProformaByToken(token) {
    await this.init();
    const cleanToken = token.replace('#', '').toLowerCase();
    return (this.data.proformas || []).find(
      p => p.publicToken === token || 
           p.id === token || 
           p.code?.replace('#', '').toLowerCase() === cleanToken
    ) || null;
  }

  async createProforma(proforma) {
    await this.init();
    const count = (this.data.proformas?.length || 0) + 1;
    const newProforma = {
      ...proforma,
      id: proforma.id || `cot-${1000 + count}`,
      code: proforma.code || `#COT-${1000 + count}`,
      createdAt: proforma.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.proformas = [newProforma, ...(this.data.proformas || [])];
    await this.persist();
    return newProforma;
  }

  async updateProforma(id, updates) {
    await this.init();
    const index = (this.data.proformas || []).findIndex(p => p.id === id || p.code === id);
    if (index === -1) return null;

    const updated = {
      ...this.data.proformas[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.proformas[index] = updated;
    await this.persist();
    return updated;
  }

  async deleteProforma(id) {
    await this.init();
    const initialLen = this.data.proformas.length;
    this.data.proformas = this.data.proformas.filter(p => p.id !== id && p.code !== id);
    if (this.data.proformas.length !== initialLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // --- CLIENTES ---
  async getClients() {
    await this.init();
    return this.data.clients || [];
  }

  async getClientById(id) {
    await this.init();
    return (this.data.clients || []).find(c => c.id === id) || null;
  }

  async createClient(client) {
    await this.init();
    const newClient = {
      ...client,
      id: client.id || `cli-${Date.now()}`,
      createdAt: client.createdAt || new Date().toISOString()
    };
    this.data.clients = [newClient, ...(this.data.clients || [])];
    await this.persist();
    return newClient;
  }

  async updateClient(id, updates) {
    await this.init();
    const index = (this.data.clients || []).findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.data.clients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.clients[index] = updated;
    await this.persist();
    return updated;
  }

  async deleteClient(id) {
    await this.init();
    const initialLen = this.data.clients.length;
    this.data.clients = this.data.clients.filter(c => c.id !== id);
    if (this.data.clients.length !== initialLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // --- PLANTILLAS ---
  async getTemplates() {
    await this.init();
    return this.data.templates || [];
  }

  async createTemplate(template) {
    await this.init();
    const newTpl = {
      ...template,
      id: template.id || `tpl-${Date.now()}`
    };
    this.data.templates = [...(this.data.templates || []), newTpl];
    await this.persist();
    return newTpl;
  }

  async updateTemplate(id, updates) {
    await this.init();
    const index = (this.data.templates || []).findIndex(t => t.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.data.templates[index],
      ...updates
    };
    this.data.templates[index] = updated;
    await this.persist();
    return updated;
  }

  async deleteTemplate(id) {
    await this.init();
    const initialLen = this.data.templates.length;
    this.data.templates = this.data.templates.filter(t => t.id !== id);
    if (this.data.templates.length !== initialLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // --- PARCELAS / PROPERTIES ---
  async getProperties() {
    await this.init();
    return this.data.properties || [];
  }

  // --- CONFIGURACIÓN ---
  async getConfig() {
    await this.init();
    return this.data.config || SEED_CONFIG;
  }

  async updateConfig(newConfig) {
    await this.init();
    this.data.config = {
      ...this.data.config,
      ...newConfig
    };
    await this.persist();
    return this.data.config;
  }
}

export const db = new Database();
