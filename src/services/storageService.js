import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { generateToken, normalizeName, formatPhoneNumber } from '../utils/formatters';
import { api } from './api';

export const COMPANY_INFO = {
  name: "Roble Constructora del Peru SAC",
  address: "Av. Victor Raul Haya de la Torre N° 127 Piso 2",
  ruc: "20611738022",
  location: "Chiclayo, Perú",
  phone: "+51 974 882 104",
  email: "ventas@robleconstructora.pe",
  website: "www.vallepacora.pe"
};

export const INITIAL_PROPERTIES = [
  {
    id: "parcela-palta-1000",
    title: "Parcela Agrícola - Palta Hass (1,000 m²)",
    category: "Palta Hass",
    cropType: "Palta Hass",
    area: 1000,
    rooms: 0,
    baths: 0,
    basePrice: 60000.00, // Financiado
    cashPrice: 57000.00, // Contado
    initialPayment: 20000.00,
    reservationFee: 1000.00,
    financedBalance: 40000.00,
    suggestedBonus: 0,
    description: "Parcela Agrícola Valle Pacora - Proyecto Palta Hass. Al contado S/ 57,000 o financiado S/ 60,000 (Inicial S/ 20,000, separación S/ 1,000).",
    planImageUrl: "/palta_hass_field.jpg",
    waterAccess: "Puntos de riego presurizado por goteo",
    amenities: [
      "Puntos de riego presurizado por goteo",
      "Título de propiedad independizado en Sunarp",
      "Suelo con pH óptimo para cultivo de Palta Hass",
      "Al Contado: S/ 57,000.00",
      "Financiado: S/ 60,000.00 (Separación S/ 1,000 + Inicial S/ 20,000)"
    ],
    details: {
      lote: "Segunda Etapa",
      etapa: "Segunda Etapa",
      cultivo: "Palta Hass (Variedad de exportación)",
      precioContado: "S/ 57,000.00",
      precioFinanciado: "S/ 60,000.00",
      inicial: "S/ 20,000.00",
      separacion: "S/ 1,000.00",
      saldoFinanciado: "S/ 40,000.00 (en cuotas directas)",
      zonificacion: "Agrícola Productiva"
    }
  },
  {
    id: "parcela-arandano-1000",
    title: "Parcela Agrícola - Arándanos (1,000 m²)",
    category: "Arándanos",
    cropType: "Arándanos",
    area: 1000,
    rooms: 0,
    baths: 0,
    basePrice: 85000.00, // Financiado
    cashPrice: 60000.00, // Contado
    initialPayment: 45000.00,
    reservationFee: 1000.00,
    financedBalance: 40000.00,
    suggestedBonus: 0,
    description: "Parcela Agrícola Valle Pacora - Proyecto Arándanos. Al contado S/ 60,000 o financiado S/ 85,000 (Inicial S/ 45,000, separación S/ 1,000).",
    planImageUrl: "/arandano_field.jpg",
    waterAccess: "Sistema de riego presurizado automatizado",
    amenities: [
      "Sistema de riego presurizado de alta precisión",
      "Título independizado listo para registro en Sunarp",
      "Camellones y sustrato preparado para Arándanos",
      "Al Contado: S/ 60,000.00",
      "Financiado: S/ 85,000.00 (Separación S/ 1,000 + Inicial S/ 45,000)"
    ],
    details: {
      lote: "Segunda Etapa",
      etapa: "Segunda Etapa",
      cultivo: "Arándanos (Variedad de alta densidad)",
      precioContado: "S/ 60,000.00",
      precioFinanciado: "S/ 85,000.00",
      inicial: "S/ 45,000.00",
      separacion: "S/ 1,000.00",
      saldoFinanciado: "S/ 40,000.00 (en cuotas directas)",
      zonificacion: "Agrícola Productiva"
    }
  }
];

export const INITIAL_PROFORMAS = [];

export const INITIAL_CLIENTS = [];

const STORAGE_KEY = 'valle_pacora_proformas_data_v4';
const CLIENTS_STORAGE_KEY = 'valle_pacora_clients_data_v3';
const TEMPLATES_STORAGE_KEY = 'valle_pacora_templates_data_v3';

export const INITIAL_TEMPLATES = [
  {
    id: "tpl-palta-contado",
    title: "Palta Hass - Pago al Contado (S/ 57,000)",
    crop: "palta", // 'palta' | 'arandano'
    category: "Palta Hass",
    area: 1000,
    unitPrice: 57000.00,
    currency: "PEN",
    description: "Parcela Agrícola Palta Hass 1,000 m² con precio especial al contado de S/ 57,000",
    propertyId: "parcela-palta-1000",
    quantity: 1,
    paymentType: "contado",
    reservation: 1000,
    initialPayment: 57000,
    balance: 0,
    months: 0,
    conditions: "Modalidad: Pago al Contado (S/ 57,000).\nSeparación: S/ 1,000.\nSaldo: S/ 56,000 contra firma de contrato y minuta en notaría.",
    includeFloorPlan: true,
    tag: "Contado Especial",
    isPopular: true
  },
  {
    id: "tpl-palta-financiado",
    title: "Palta Hass - Financiado (S/ 60,000)",
    crop: "palta",
    category: "Palta Hass",
    area: 1000,
    unitPrice: 60000.00,
    currency: "PEN",
    description: "Parcela Agrícola Palta Hass 1,000 m² financiada (Inicial S/ 20k, separación S/ 1k, saldo financiado)",
    propertyId: "parcela-palta-1000",
    quantity: 1,
    paymentType: "financiado",
    reservation: 1000,
    initialPayment: 20000,
    balance: 40000,
    months: 24,
    monthlyInstallment: 1666.67,
    conditions: "Modalidad: Financiado (S/ 60,000).\nSeparación: S/ 1,000.\nInicial: S/ 20,000 en 15 días.\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos.",
    includeFloorPlan: true,
    tag: "Más Cotizado",
    isPopular: true
  },
  {
    id: "tpl-arandano-contado",
    title: "Arándanos - Pago al Contado (S/ 60,000)",
    crop: "arandano",
    category: "Arándanos",
    area: 1000,
    unitPrice: 60000.00,
    currency: "PEN",
    description: "Parcela Agrícola Arándanos 1,000 m² con precio de oportunidad al contado de S/ 60,000",
    propertyId: "parcela-arandano-1000",
    quantity: 1,
    paymentType: "contado",
    reservation: 1000,
    initialPayment: 60000,
    balance: 0,
    months: 0,
    conditions: "Modalidad: Pago al Contado (S/ 60,000).\nSeparación: S/ 1,000.\nSaldo: S/ 59,000 contra firma de contrato y minuta en notaría.",
    includeFloorPlan: true,
    tag: "Contado Oportunidad",
    isPopular: true
  },
  {
    id: "tpl-arandano-financiado",
    title: "Arándanos - Financiado (S/ 85,000)",
    crop: "arandano",
    category: "Arándanos",
    area: 1000,
    unitPrice: 85000.00,
    currency: "PEN",
    description: "Parcela Agrícola Arándanos 1,000 m² financiada (Inicial S/ 45k, separación S/ 1k, saldo financiado)",
    propertyId: "parcela-arandano-1000",
    quantity: 1,
    paymentType: "financiado",
    reservation: 1000,
    initialPayment: 45000,
    balance: 40000,
    months: 24,
    monthlyInstallment: 1666.67,
    conditions: "Modalidad: Financiado (S/ 85,000).\nSeparación: S/ 1,000.\nInicial: S/ 45,000 en 15 días.\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos.",
    includeFloorPlan: true,
    tag: "Alta Rentabilidad",
    isPopular: true
  }
];

export const DEFAULT_CONFIG = {
  company: {
    name: "Roble Constructora del Peru SAC",
    brandName: "Valle Pacora",
    ruc: "20611738022",
    address: "Av. Victor Raul Haya de la Torre N° 127 Piso 2",
    city: "Chiclayo, Perú",
    phone: "+51 974 882 104",
    email: "ventas@robleconstructora.pe",
    website: "www.vallepacora.pe",
    logoText: "Valle Pacora"
  },
  bankAccounts: [
    {
      id: "bank-bcp",
      bank: "Banco de Crédito del Perú (BCP)",
      currency: "Soles (PEN)",
      accountType: "Cuenta Corriente",
      accountNumber: "3057063526053",
      cci: "00230500706352605315",
      holder: "Roble Constructora del Peru SAC"
    },
    {
      id: "bank-bbva-pen",
      bank: "BBVA Continental",
      currency: "Soles (PEN)",
      accountType: "Cuenta Corriente",
      accountNumber: "001103480200403552",
      cci: "01134800020040355209",
      holder: "Roble Constructora del Peru SAC"
    },
    {
      id: "bank-bbva-usd",
      bank: "BBVA Continental",
      currency: "Dólares (USD)",
      accountType: "Cuenta Corriente",
      accountNumber: "001103480200438836",
      cci: "01134800020043883605",
      holder: "Roble Constructora del Peru SAC"
    }
  ],
  commercialDefaults: {
    currency: "PEN",
    validDays: 7,
    separationAmount: 1000,
    defaultNotes: "Forma de pago: S/ 1,000 de separación y 60% de inicial máximo en 15 días.\nTiempo de validez de la proforma 7 días calendarios.\nEntrega de puntos de riego tecnificado y título independizado en Sunarp."
  },
  advisor: {
    name: "Daniel Balarezo",
    role: "Asesor Comercial",
    phone: "+51 987 654 321",
    email: "daniel.balarezo@vallepacora.pe"
  },
  advisors: [
    {
      id: "advisor-1",
      name: "Daniel Balarezo",
      role: "Asesor Comercial Especializado",
      phone: "+51 987 654 321",
      email: "daniel.balarezo@vallepacora.pe",
      isDefault: true
    }
  ],
  whatsappMessageTemplate: "Hola {cliente}, le saluda {asesor} de Valle Pacora. Le comparto su proforma formal {codigo} por su Parcela Agrícola de {monto}:\n\nPuede revisarla en línea y descargar el PDF oficial aquí:\n{enlace}\n\nQuedo a su disposición para coordinar los siguientes pasos de su separación."
};

export const OFFICIAL_BANK_ACCOUNTS = DEFAULT_CONFIG.bankAccounts;

const CONFIG_STORAGE_KEY = 'valle_pacora_settings_config_v2';

export const storageService = {
  // Inicializar o cargar desde localStorage
  getDeletedProformaIds() {
    try {
      const stored = localStorage.getItem('valle_pacora_deleted_proformas');
      const list = stored ? JSON.parse(stored) : [];
      return new Set(list);
    } catch {
      return new Set();
    }
  },

  markProformaAsDeleted(id) {
    if (!id) return;
    try {
      const set = this.getDeletedProformaIds();
      set.add(String(id));
      localStorage.setItem('valle_pacora_deleted_proformas', JSON.stringify(Array.from(set)));
    } catch {}
  },

  unmarkProformaAsDeleted(id) {
    if (!id) return;
    try {
      const set = this.getDeletedProformaIds();
      set.delete(String(id));
      localStorage.setItem('valle_pacora_deleted_proformas', JSON.stringify(Array.from(set)));
    } catch {}
  },

  mergeProformasLists(localList = [], serverList = []) {
    const deletedIds = this.getDeletedProformaIds();
    const map = new Map();

    // 1. Agregar proformas del servidor no eliminadas
    (serverList || []).forEach(p => {
      if (p && (p.id || p.code)) {
        const idKey = String(p.id || '');
        const codeKey = String(p.code || '');
        if (!deletedIds.has(idKey) && !deletedIds.has(codeKey)) {
          map.set(idKey || codeKey, p);
        }
      }
    });

    // 2. Fusionar con las proformas locales (lo creado localmente nunca se borra)
    (localList || []).forEach(p => {
      if (p && (p.id || p.code)) {
        const idKey = String(p.id || '');
        const codeKey = String(p.code || '');
        if (!deletedIds.has(idKey) && !deletedIds.has(codeKey)) {
          const key = idKey || codeKey;
          const existing = map.get(key);
          if (!existing) {
            map.set(key, p);
          } else {
            const timeLocal = new Date(p.updatedAt || p.createdAt || 0).getTime();
            const timeServer = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
            if (timeLocal >= timeServer) {
              map.set(key, p);
            }
          }
        }
      }
    });

    const result = Array.from(map.values());
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return timeB - timeA;
    });
    return result;
  },

  getProformasSync() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFORMAS));
      return INITIAL_PROFORMAS;
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return INITIAL_PROFORMAS;
    }
  },

  async getProformas() {
    const localList = this.getProformasSync();

    // 1. Intentar Firebase Firestore en tiempo real si está activo
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'proformas'));
        const list = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt || data.updatedAt || new Date().toISOString(),
            updatedAt: data.updatedAt || data.createdAt || new Date().toISOString()
          };
        });

        const merged = this.mergeProformasLists(localList, list);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      } catch (err) {
        console.warn('[Firebase] Error leyendo proformas de Firestore:', err.message);
      }
    }

    // 2. Intentar backend API como respaldo (Fusión Inteligente: nunca sobreescribe datos locales)
    try {
      const serverList = await api.getProformas();
      if (Array.isArray(serverList) && serverList.length > 0) {
        const merged = this.mergeProformasLists(localList, serverList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('[Storage] API backend no disponible, usando caché local:', err.message);
    }

    // 3. Fallback a caché local
    return localList;
  },

  async getProformaById(id) {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'proformas', id));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() };
        }
      } catch (err) {
        console.warn('[Firebase] Error buscando proforma por ID en Firestore:', err.message);
      }
    }

    try {
      const item = await api.getProformaById(id);
      if (item) return item;
    } catch (err) {}

    const list = this.getProformasSync();
    return list.find(p => p.id === id || p.code === id) || null;
  },

  async getProformaByToken(token) {
    const cleanToken = token.replace('#', '').toLowerCase();

    // 1. Verificar si en la URL hay datos codificados directamente
    if (typeof window !== 'undefined' && window.location) {
      try {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('d');
        if (encoded) {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
          if (decoded && (decoded.publicToken === token || decoded.code?.replace('#', '').toLowerCase() === cleanToken || decoded.id === token)) {
            // Guardar en caché local para que persista
            this.saveProforma(decoded).catch(() => {});
            return decoded;
          }
        }
      } catch {}
    }

    // 2. Buscar en caché local de inmediato
    const list = this.getProformasSync();
    const localFound = list.find(p => p.publicToken === token || p.id === token || p.code?.replace('#', '').toLowerCase() === cleanToken);
    if (localFound) return localFound;

    // 3. Buscar en Firebase Firestore
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'proformas'), where('publicToken', '==', token));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          return { id: d.id, ...d.data() };
        }
      } catch (err) {
        console.warn('[Firebase] Error buscando por token en Firestore:', err.message);
      }
    }

    // 4. Buscar en Backend API
    try {
      const item = await api.getProformaByToken(token);
      if (item) return item;
    } catch (err) {}

    return null;
  },

  async saveProforma(proforma) {
    const list = this.getProformasSync();
    const existingIndex = list.findIndex(p => p.id === proforma.id);
    const now = new Date().toISOString();

    const clientNormalized = proforma.client ? {
      ...proforma.client,
      name: normalizeName(proforma.client.name || ''),
      phone: proforma.client.phone ? formatPhoneNumber(proforma.client.phone) : ''
    } : proforma.client;

    const proformaWithDefaults = {
      ...proforma,
      client: clientNormalized,
      id: proforma.id || `cot-${Date.now()}`,
      code: proforma.code || `#COT-${1001 + list.length}`,
      createdAt: proforma.createdAt || proforma.updatedAt || now,
      updatedAt: now,
      formattedDate: proforma.formattedDate || new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      publicToken: proforma.publicToken || generateToken()
    };

    // Asegurar que no esté en la lista de eliminados
    this.unmarkProformaAsDeleted(proformaWithDefaults.id);
    if (proformaWithDefaults.code) {
      this.unmarkProformaAsDeleted(proformaWithDefaults.code);
    }

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = proformaWithDefaults;
    } else {
      updatedList = [proformaWithDefaults, ...list];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }

    // Persistir directamente en Firebase Firestore si está activo
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'proformas', proformaWithDefaults.id), proformaWithDefaults, { merge: true });
        console.log('[Firebase] Proforma guardada exitosamente en Firestore:', proformaWithDefaults.id);
      } catch (err) {
        console.warn('[Firebase] Error guardando proforma en Firestore:', err.message);
      }
    }

    // Sincronizar con API backend
    try {
      if (existingIndex >= 0) {
        await api.updateProforma(proformaWithDefaults.id, proformaWithDefaults);
      } else {
        await api.createProforma(proformaWithDefaults);
      }
    } catch (err) {
      console.warn('[Storage] Error sincronizando proforma con backend:', err.message);
    }

    // Auto-sincronizar el cliente en el Directorio de Clientes (cero doble trabajo)
    if (proformaWithDefaults.client && proformaWithDefaults.client.name?.trim()) {
      try {
        await this.syncClientFromProforma(proformaWithDefaults);
      } catch (err) {
        console.warn('[Storage] Error sincronizando cliente desde proforma:', err);
      }
    }

    return proformaWithDefaults;
  },

  async deleteProforma(id) {
    this.markProformaAsDeleted(id);
    const list = this.getProformasSync();
    const item = list.find(p => p.id === id || p.code === id);
    if (item?.code) {
      this.markProformaAsDeleted(item.code);
    }

    const updated = list.filter(p => p.id !== id && p.code !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'proformas', id));
        console.log('[Firebase] Proforma eliminada de Firestore:', id);
      } catch (err) {
        console.warn('[Firebase] Error eliminando proforma de Firestore:', err.message);
      }
    }

    try {
      await api.deleteProforma(id);
    } catch (err) {
      console.warn('[Storage] Error al eliminar en backend:', err.message);
    }
    return true;
  },

  async updateStatus(id, newStatus) {
    const list = this.getProformasSync();
    const item = list.find(p => p.id === id || p.code === id);
    if (!item) return null;

    const targetId = item.id;
    item.status = newStatus;
    item.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'proformas', targetId), { 
          status: newStatus, 
          updatedAt: item.updatedAt 
        }, { merge: true });
        console.log('[Firebase] Estado actualizado en Firestore:', targetId, newStatus);
      } catch (err) {
        console.warn('[Firebase] Error actualizando estado en Firestore:', err.message);
      }
    }

    try {
      await api.updateProformaStatus(targetId, newStatus);
    } catch (err) {
      console.warn('[Storage] Error al actualizar estado en backend:', err.message);
    }
    return item;
  },

  async duplicateProforma(id) {
    const list = await this.getProformas();
    const item = list.find(p => p.id === id || p.code === id);
    if (!item) return null;

    const maxCode = (list || []).reduce((max, p) => {
      const match = p.code?.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 1000;
      return num > max ? num : max;
    }, 1000);
    const nextCodeNumber = maxCode + 1;
    const newId = `cot-${nextCodeNumber}`;

    const now = new Date().toISOString();
    const duplicated = {
      ...item,
      id: newId,
      code: `#COT-${nextCodeNumber}`,
      status: 'borrador',
      createdAt: now,
      updatedAt: now,
      formattedDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      publicToken: generateToken()
    };

    return await this.saveProforma(duplicated);
  },

  getProperties() {
    return INITIAL_PROPERTIES;
  },

  // -------------------------------------------------------------
  // GESTIÓN DE CLIENTES & LEADS (Sincronización Automática con Proformas)
  // -------------------------------------------------------------
  mergeClientsFromProformas(proformas, currentClients = []) {
    const clientsMap = new Map();

    // 1. Cargar clientes existentes
    (currentClients || []).forEach(c => {
      const key = (c.docNumber && c.docNumber.trim()) ? c.docNumber.trim() : c.name?.toLowerCase().trim();
      if (key) {
        clientsMap.set(key, c);
      }
    });

    // 2. Extraer y fusionar clientes de cada proforma (retroactivo y en vivo)
    (proformas || []).forEach(p => {
      const c = p.client;
      if (!c || !c.name || !c.name.trim()) return;
      const key = (c.docNumber && c.docNumber.trim()) ? c.docNumber.trim() : c.name.toLowerCase().trim();
      if (!key) return;

      const projectTitle = p.items?.[0]?.description || 'Parcela Agrícola - Palta Hass (1,000 m²)';

      if (clientsMap.has(key)) {
        const existing = clientsMap.get(key);
        clientsMap.set(key, {
          ...existing,
          email: existing.email || c.email || '',
          phone: existing.phone || c.phone || '',
          docType: existing.docType || c.docType || 'DNI',
          docNumber: existing.docNumber || c.docNumber || '',
          interestProject: existing.interestProject || projectTitle,
          budget: Math.max(Number(existing.budget) || 0, Number(p.total) || 60000.00),
          status: 'cotizado'
        });
      } else {
        const newClient = {
          id: `cli-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: c.name.trim(),
          docType: c.docType || 'DNI',
          docNumber: c.docNumber?.trim() || '',
          email: c.email?.trim() || '',
          phone: c.phone?.trim() || '',
          city: 'Chiclayo',
          interestProject: projectTitle,
          budget: Number(p.total) || 60000.00,
          status: 'cotizado',
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString()
        };
        clientsMap.set(key, newClient);
      }
    });

    return Array.from(clientsMap.values());
  },

  async syncClientFromProforma(proforma) {
    const c = proforma.client;
    if (!c || !c.name || !c.name.trim()) return null;

    const list = this.getClientsSync();
    const existingIndex = list.findIndex(item =>
      (c.docNumber && item.docNumber && item.docNumber.trim() === c.docNumber.trim()) ||
      (c.name && item.name && item.name.toLowerCase().trim() === c.name.toLowerCase().trim())
    );

    const projectTitle = proforma.items?.[0]?.description || 'Parcela Agrícola - Palta Hass (1,000 m²)';

    let targetClient;
    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      targetClient = {
        ...existing,
        name: c.name.trim(),
        docType: c.docType || existing.docType || 'DNI',
        docNumber: c.docNumber?.trim() || existing.docNumber || '',
        email: c.email?.trim() || existing.email || '',
        phone: c.phone?.trim() || existing.phone || '',
        interestProject: projectTitle || existing.interestProject,
        budget: Number(proforma.total) || Number(existing.budget) || 60000.00,
        status: 'cotizado',
        updatedAt: new Date().toISOString()
      };
    } else {
      targetClient = {
        id: `cli-${Date.now()}`,
        name: c.name.trim(),
        docType: c.docType || 'DNI',
        docNumber: c.docNumber?.trim() || '',
        email: c.email?.trim() || '',
        phone: c.phone?.trim() || '',
        city: 'Chiclayo',
        interestProject: projectTitle,
        budget: Number(proforma.total) || 60000.00,
        status: 'cotizado',
        createdAt: proforma.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    await this.saveClient(targetClient);
    return targetClient;
  },

  getClientsSync() {
    try {
      const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
      let list = stored ? JSON.parse(stored) : INITIAL_CLIENTS;

      // Auto-fusionar retroactivamente con las proformas existentes
      const proformas = this.getProformasSync();
      const merged = this.mergeClientsFromProformas(proformas, list);
      if (merged.length > list.length) {
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    } catch (e) {
      console.error('Error reading localStorage for clients:', e);
      return INITIAL_CLIENTS;
    }
  },

  async getClients() {
    let list = [];

    // 1. Intentar Firebase Firestore en tiempo real
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'clients'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn('[Firebase] Error leyendo clientes de Firestore:', err.message);
      }
    }

    // 2. Intentar backend API local
    if (list.length === 0) {
      try {
        const serverList = await api.getClients();
        if (Array.isArray(serverList) && serverList.length > 0) {
          list = serverList;
        }
      } catch (err) {
        console.warn('[Storage] Backend clients fallback:', err.message);
      }
    }

    // 3. Fallback a caché local
    if (list.length === 0) {
      list = this.getClientsSync();
    }

    // 4. Auto-fusionar retroactivamente con las proformas
    const proformas = this.getProformasSync();
    const merged = this.mergeClientsFromProformas(proformas, list);

    if (merged.length > list.length) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(merged));
      // Guardar nuevos en Firestore
      if (isFirebaseConfigured && db) {
        merged.forEach(c => {
          if (!list.some(item => item.id === c.id)) {
            setDoc(doc(db, 'clients', c.id), c, { merge: true }).catch(() => {});
          }
        });
      }
    }

    return merged;
  },

  async getClientById(id) {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'clients', id));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() };
        }
      } catch (err) {}
    }

    try {
      const client = await api.getClientById(id);
      if (client) return client;
    } catch (err) {}

    const list = this.getClientsSync();
    return list.find(c => c.id === id) || null;
  },

  async saveClient(client) {
    const list = this.getClientsSync();
    const existingIndex = list.findIndex(c => c.id === client.id);

    const clientWithDefaults = {
      ...client,
      name: normalizeName(client.name || ''),
      phone: client.phone ? formatPhoneNumber(client.phone) : '',
      updatedAt: new Date().toISOString()
    };

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = clientWithDefaults;
    } else {
      clientWithDefaults.id = client.id || `cli-${Date.now()}`;
      clientWithDefaults.createdAt = client.createdAt || new Date().toISOString();
      updatedList = [clientWithDefaults, ...list];
    }

    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updatedList));

    // Persistir directamente en Firebase Firestore
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'clients', clientWithDefaults.id), clientWithDefaults, { merge: true });
        console.log('[Firebase] Cliente guardado en Firestore:', clientWithDefaults.id);
      } catch (err) {
        console.warn('[Firebase] Error guardando cliente en Firestore:', err.message);
      }
    }

    try {
      if (existingIndex >= 0) {
        await api.updateClient(clientWithDefaults.id, clientWithDefaults);
      } else {
        await api.createClient(clientWithDefaults);
      }
    } catch (err) {
      console.warn('[Storage] Error guardando cliente en backend:', err.message);
    }

    return clientWithDefaults;
  },

  async deleteClient(id) {
    const list = this.getClientsSync();
    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(filtered));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'clients', id));
        console.log('[Firebase] Cliente eliminado de Firestore:', id);
      } catch (err) {
        console.warn('[Firebase] Error eliminando cliente en Firestore:', err.message);
      }
    }

    try {
      await api.deleteClient(id);
    } catch (err) {
      console.warn('[Storage] Error eliminando cliente en backend:', err.message);
    }
    return true;
  },

  // -------------------------------------------------------------
  // GESTIÓN DE PLANTILLAS DE PARCELAS AGRÍCOLAS (Palta Hass & Arándanos)
  // Exactamente 4 plantillas: 2 Contado y 2 Financiados
  // -------------------------------------------------------------
  getTemplatesSync() {
    try {
      const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);
        if (parsed.some(t => t.id === 'tpl-separacion-provincia') || parsed.length > 4) {
          parsed = parsed.filter(t => t.id !== 'tpl-separacion-provincia');
          if (parsed.length > 4) {
            parsed = INITIAL_TEMPLATES;
          }
          localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(INITIAL_TEMPLATES));
      return INITIAL_TEMPLATES;
    } catch (e) {
      console.error('Error reading localStorage for templates:', e);
      return INITIAL_TEMPLATES;
    }
  },

  async getTemplates() {
    // 1. Intentar Firebase Firestore
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'templates'));
        if (!snap.empty) {
          let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          list = list.filter(t => t.id !== 'tpl-separacion-provincia');
          localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(list));
          return list;
        } else {
          // Sembrar las 4 plantillas oficiales en Firestore
          for (const tpl of INITIAL_TEMPLATES) {
            await setDoc(doc(db, 'templates', tpl.id), tpl);
          }
          return INITIAL_TEMPLATES;
        }
      } catch (err) {
        console.warn('[Firebase] Error obteniendo plantillas de Firestore:', err.message);
      }
    }

    // 2. Intentar backend API
    try {
      const serverList = await api.getTemplates();
      if (Array.isArray(serverList) && serverList.length > 0) {
        const filtered = serverList.filter(t => t.id !== 'tpl-separacion-provincia');
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
      }
    } catch (err) {
      console.warn('[Storage] Backend templates fallback:', err.message);
    }

    return this.getTemplatesSync();
  },

  async getTemplateById(id) {
    const list = this.getTemplatesSync();
    return list.find(t => t.id === id) || null;
  },

  async saveTemplate(template) {
    const list = this.getTemplatesSync();
    const existingIndex = list.findIndex(t => t.id === template.id);

    const templateWithDefaults = {
      ...template,
      updatedAt: new Date().toISOString()
    };

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = templateWithDefaults;
    } else {
      templateWithDefaults.id = template.id || `tpl-${Date.now()}`;
      templateWithDefaults.createdAt = new Date().toISOString();
      updatedList = [templateWithDefaults, ...list];
    }

    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'templates', templateWithDefaults.id), templateWithDefaults, { merge: true });
      } catch (err) {
        console.warn('[Firebase] Error guardando plantilla en Firestore:', err.message);
      }
    }

    try {
      if (existingIndex >= 0) {
        await api.updateTemplate(templateWithDefaults.id, templateWithDefaults);
      } else {
        await api.createTemplate(templateWithDefaults);
      }
    } catch (err) {
      console.warn('[Storage] Error guardando plantilla en backend:', err.message);
    }

    return templateWithDefaults;
  },

  async deleteTemplate(id) {
    const list = this.getTemplatesSync();
    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'templates', id));
      } catch (err) {
        console.warn('[Firebase] Error eliminando plantilla en Firestore:', err.message);
      }
    }

    try {
      await api.deleteTemplate(id);
    } catch (err) {
      console.warn('[Storage] Error eliminando plantilla en backend:', err.message);
    }
    return true;
  },

  // -------------------------------------------------------------
  // CONFIGURACIÓN DEL COTIZADOR (Empresa, Cuentas, Asesor, WhatsApp)
  // -------------------------------------------------------------
  getConfigSync() {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        let hasChanges = false;
        if (Array.isArray(parsed.advisors)) {
          const cleaned = parsed.advisors.filter(a => a.name !== 'Janet Morales' && a.name !== 'Carlos Mendoza');
          if (cleaned.length !== parsed.advisors.length) {
            parsed.advisors = cleaned;
            hasChanges = true;
          }
        }
        if (!parsed.advisors || parsed.advisors.length === 0) {
          parsed.advisors = DEFAULT_CONFIG.advisors;
          hasChanges = true;
        }
        if (hasChanges) {
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    } catch (e) {
      console.error('Error reading localStorage for config:', e);
      return DEFAULT_CONFIG;
    }
  },

  async getConfig() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'config'));
        if (snap.exists()) {
          const cfg = snap.data();
          if (Array.isArray(cfg.advisors)) {
            cfg.advisors = cfg.advisors.filter(a => a.name !== 'Janet Morales' && a.name !== 'Carlos Mendoza');
          }
          if (!cfg.advisors || cfg.advisors.length === 0) {
            cfg.advisors = DEFAULT_CONFIG.advisors;
          }
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
          return cfg;
        } else {
          // Sembrar config oficial en Firestore si aún no existe
          await setDoc(doc(db, 'settings', 'config'), DEFAULT_CONFIG);
          return DEFAULT_CONFIG;
        }
      } catch (err) {
        console.warn('[Firebase] Error obteniendo config de Firestore:', err.message);
      }
    }

    try {
      const serverConfig = await api.getConfig();
      if (serverConfig) {
        if (Array.isArray(serverConfig.advisors)) {
          serverConfig.advisors = serverConfig.advisors.filter(a => a.name !== 'Janet Morales' && a.name !== 'Carlos Mendoza');
        }
        if (!serverConfig.advisors || serverConfig.advisors.length === 0) {
          serverConfig.advisors = DEFAULT_CONFIG.advisors;
        }
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(serverConfig));
        return serverConfig;
      }
    } catch (err) {
      console.warn('[Storage] Backend config fallback:', err.message);
    }
    return this.getConfigSync();
  },

  async saveConfig(config) {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {}

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'settings', 'config'), config, { merge: true });
        console.log('[Firebase] Configuración guardada en Firestore');
      } catch (err) {
        console.warn('[Firebase] Error guardando config en Firestore:', err.message);
      }
    }

    try {
      await api.updateConfig(config);
    } catch (err) {
      console.warn('[Storage] Error guardando config en backend:', err.message);
    }

    return config;
  }
};

