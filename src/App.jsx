import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { storageService } from './services/storageService';
import Dashboard from './pages/Dashboard';
import CreateProforma from './pages/CreateProforma';
import Clients from './pages/Clients';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import Documents from './pages/Documents';
import PublicView from './pages/PublicView';
import { downloadProformaPdf } from './utils/pdfGenerator';
import { generateToken } from './utils/formatters';

export default function App() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'create' | 'edit' | 'public' | 'clients' | 'templates' | 'settings'
  const [proformas, setProformas] = useState(() => storageService.getProformasSync());
  const [clients, setClients] = useState(() => storageService.getClientsSync());
  const [templates, setTemplates] = useState(() => storageService.getTemplatesSync());
  const [config, setConfig] = useState(() => storageService.getConfigSync());
  const [advisors, setAdvisors] = useState(() => storageService.getAdvisorsSync());
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [publicToken, setPublicToken] = useState(null);
  const [properties, setProperties] = useState(() => storageService.getProperties());
  const [loading, setLoading] = useState(false);

  // Detectar si la URL es /p/:token
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/p/')) {
      const token = path.replace(/^\/p\//, '').replace(/\/+$/, '');
      if (token) {
        setPublicToken(token);
        setCurrentView('public');
      }
    }
  }, []);

  // Cargar proformas, clientes, asesores, plantillas, parcelas y configuración
  const refreshData = async () => {
    setLoading(true);
    const list = await storageService.getProformas();
    setProformas(list);
    const clientsList = await storageService.getClients();
    setClients(clientsList);
    const advisorsList = await storageService.getAdvisors();
    setAdvisors(advisorsList);
    setTemplates(storageService.getTemplatesSync());
    setProperties(storageService.getProperties());
    setConfig(storageService.getConfigSync());
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handlers
  const handleNewProforma = () => {
    const activeAdvisors = (advisors && advisors.length > 0) ? advisors : storageService.getAdvisorsSync();
    const defaultAdvisor = activeAdvisors.find(a => a.isDefault) || activeAdvisors[0] || {
      id: 'advisor-1',
      name: user?.name || config?.advisor?.name || 'Daniel Balarezo',
      phone: user?.phone || config?.advisor?.phone || '+51 987 654 321',
      role: user?.role || config?.advisor?.role || 'Asesor Comercial Especializado',
      email: user?.email || config?.advisor?.email || 'daniel.balarezo@vallepacora.pe'
    };

    const maxCode = (proformas || []).reduce((max, p) => {
      const match = p.code?.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 1000;
      return num > max ? num : max;
    }, 1000);
    const nextCodeNumber = maxCode + 1;
    const initialProperty = properties[0];

    const newProforma = {
      id: `cot-${nextCodeNumber}`,
      code: `#COT-${nextCodeNumber}`,
      advisorId: defaultAdvisor.id || 'advisor-1',
      advisorName: defaultAdvisor.name || 'Daniel Balarezo',
      advisorPhone: defaultAdvisor.phone || '+51 987 654 321',
      advisorRole: defaultAdvisor.role || 'Asesor Comercial Especializado',
      advisorEmail: defaultAdvisor.email || 'daniel.balarezo@vallepacora.pe',
      status: 'borrador',
      currency: 'PEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      client: {
        name: '',
        docType: 'DNI',
        docNumber: '',
        email: '',
        phone: '',
        validDays: '7 días hábiles'
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: initialProperty?.title || 'Parcela Agrícola - Palta Hass (1,000 m²)',
          quantity: 1,
          unitPrice: initialProperty?.basePrice || 60000.00,
          discount: 0,
          total: initialProperty?.basePrice || 60000.00
        }
      ],
      includeFloorPlan: true,
      selectedPropertyId: initialProperty?.id || 'parcela-palta-1000',
      subtotal: initialProperty?.basePrice || 60000.00,
      totalDiscount: 0,
      tax: 0,
      total: initialProperty?.basePrice || 60000.00,
      conditions: {
        validDays: 7,
        paymentMethod: 'Financiamiento Directo / Separación con S/ 1,000',
        notes: 'Modalidad: Financiado (S/ 60,000).\nSeparación: S/ 1,000.\nInicial: S/ 20,000 en 15 días.\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos.\nValidez: 7 días calendarios.'
      },
      publicToken: generateToken()
    };

    setSelectedProforma(newProforma);
    setCurrentView('create');
  };

  const handleEditProforma = (proformaOrId) => {
    let target = proformaOrId;
    if (typeof proformaOrId === 'string') {
      target = (proformas || []).find(p => p.id === proformaOrId || p.code === proformaOrId) ||
               storageService.getProformasSync().find(p => p.id === proformaOrId || p.code === proformaOrId);
    }
    setSelectedProforma(target || defaultHardcodedProforma);
    setCurrentView('edit');
  };

  const handleSelectProforma = (proforma) => {
    setSelectedProforma(proforma);
    if (proforma.publicToken) {
      setPublicToken(proforma.publicToken);
      setCurrentView('public');
    }
  };

  const handleSaveProforma = async (proformaToSave) => {
    const saved = await storageService.saveProforma(proformaToSave);
    const updatedList = await storageService.getProformas();
    const updatedClients = await storageService.getClients();
    setProformas(updatedList);
    setClients(updatedClients);
    setSelectedProforma(saved);
    return saved;
  };

  const handleDuplicateProforma = async (id) => {
    await storageService.duplicateProforma(id);
    const updated = await storageService.getProformas();
    setProformas(updated);
  };

  const handleChangeStatus = async (id, newStatus) => {
    await storageService.updateStatus(id, newStatus);
    const updated = await storageService.getProformas();
    setProformas(updated);
  };

  const handleDeleteProforma = async (id) => {
    const item = (proformas || []).find(p => p.id === id || p.code === id);
    const label = item ? `${item.code} (${item.client?.name || 'Cliente'})` : id;
    if (window.confirm(`¿Estás seguro de eliminar la proforma ${label}?`)) {
      await storageService.deleteProforma(id);
      const updated = await storageService.getProformas();
      setProformas(updated);
    }
  };

  // Client Handlers
  const handleNewClient = async (clientData) => {
    await storageService.saveClient(clientData);
    setClients(storageService.getClientsSync());
  };

  const handleEditClient = async (clientData) => {
    await storageService.saveClient(clientData);
    setClients(storageService.getClientsSync());
  };

  const handleDeleteClient = async (clientId) => {
    await storageService.deleteClient(clientId);
    setClients(storageService.getClientsSync());
  };

  const handleQuoteForClient = (client) => {
    const nextCodeNumber = 1001 + proformas.length;
    const initialProperty = properties[0];

    const newProforma = {
      id: `cot-${nextCodeNumber}`,
      code: `#COT-${nextCodeNumber}`,
      advisorId: user?.uid || 'asesor-1',
      advisorName: user?.name || 'Daniel Balarezo',
      advisorPhone: user?.phone || '+51 987 654 321',
      advisorRole: user?.role || 'Asesor Comercial',
      status: 'borrador',
      currency: 'PEN',
      createdAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      client: {
        name: client.name,
        docType: client.docType || 'DNI',
        docNumber: client.docNumber || '',
        email: client.email || '',
        phone: client.phone || '',
        validDays: '7 días hábiles'
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: client.interestProject || initialProperty?.title || 'Parcela Agrícola - Palta Hass (1,000 m²)',
          quantity: 1,
          unitPrice: client.budget || initialProperty?.basePrice || 60000.00,
          discount: 0,
          total: client.budget || initialProperty?.basePrice || 60000.00
        }
      ],
      includeFloorPlan: Boolean(initialProperty?.planImageUrl),
      selectedPropertyId: initialProperty?.id || 'parcela-palta-1000',
      subtotal: client.budget || 60000.00,
      totalDiscount: 0,
      tax: 0,
      total: client.budget || 60000.00,
      conditions: {
        validDays: '7 días calendarios',
        paymentType: 'financiado',
        reservation: 1000,
        initialPayment: 20000,
        balance: 40000,
        months: 24,
        monthlyInstallment: 1666.67,
        paymentMethod: 'Financiamiento Directo / Separación con S/ 1,000',
        notes: client.notes ? `Notas cliente: ${client.notes}\nForma de pago: S/ 1,000 de separación.` : 'Modalidad: Financiado (S/ 60,000).\nSeparación: S/ 1,000.\nInicial: S/ 20,000 en 15 días.\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos.'
      },
      publicToken: generateToken()
    };

    setSelectedProforma(newProforma);
    setCurrentView('create');
  };

  // Template Handlers (Parcelas Agrícolas de Palta Hass & Arándanos)
  const handleNewTemplate = async (tplData) => {
    await storageService.saveTemplate(tplData);
    setTemplates(storageService.getTemplatesSync());
  };

  const handleEditTemplate = async (tplData) => {
    await storageService.saveTemplate(tplData);
    setTemplates(storageService.getTemplatesSync());
  };

  const handleDeleteTemplate = async (tplId) => {
    await storageService.deleteTemplate(tplId);
    setTemplates(storageService.getTemplatesSync());
  };

  const handleUseTemplate = (tpl) => {
    const defaultAdvisor = config?.advisors?.find(a => a.isDefault) || config?.advisors?.[0] || {
      id: 'asesor-1',
      name: user?.name || config?.advisor?.name || 'Daniel Balarezo',
      phone: user?.phone || config?.advisor?.phone || '+51 987 654 321',
      role: user?.role || config?.advisor?.role || 'Asesor Comercial Especializado',
      email: user?.email || config?.advisor?.email || 'daniel.balarezo@vallepacora.pe'
    };

    const nextCodeNumber = 1001 + proformas.length;
    const prop = properties.find(p => p.id === tpl.propertyId) || properties[0];
    const quantity = Number(tpl.quantity) || 1;
    const unitPrice = Number(tpl.unitPrice) || 60000;
    const discount = Number(tpl.discount) || 0;
    const subtotal = unitPrice * quantity;
    const total = Math.max(0, subtotal - discount);

    const newProforma = {
      id: `cot-${nextCodeNumber}`,
      code: `#COT-${nextCodeNumber}`,
      advisorId: defaultAdvisor.id || 'asesor-1',
      advisorName: defaultAdvisor.name || 'Daniel Balarezo',
      advisorPhone: defaultAdvisor.phone || '+51 987 654 321',
      advisorRole: defaultAdvisor.role || 'Asesor Comercial Especializado',
      advisorEmail: defaultAdvisor.email || 'daniel.balarezo@vallepacora.pe',
      status: 'borrador',
      currency: tpl.currency || 'PEN',
      createdAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      client: {
        name: '',
        docType: 'DNI',
        docNumber: '',
        email: '',
        phone: '',
        validDays: '7 días hábiles'
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: tpl.description || tpl.title,
          quantity: quantity,
          unitPrice: unitPrice,
          discount: discount,
          total: total
        }
      ],
      includeFloorPlan: Boolean(tpl.includeFloorPlan),
      selectedPropertyId: prop?.id || 'parcela-palta-1000',
      subtotal: subtotal,
      totalDiscount: discount,
      tax: 0,
      total: total,
      conditions: {
        validDays: 7,
        paymentType: tpl.paymentType || (tpl.title?.toLowerCase().includes('contado') ? 'contado' : 'financiado'),
        reservation: tpl.reservation !== undefined ? tpl.reservation : 1000,
        initialPayment: tpl.initialPayment !== undefined ? tpl.initialPayment : (tpl.title?.toLowerCase().includes('contado') ? total : (total >= 80000 ? 45000 : 20000)),
        balance: tpl.balance !== undefined ? tpl.balance : (tpl.title?.toLowerCase().includes('contado') ? 0 : Math.max(0, total - (total >= 80000 ? 45000 : 20000))),
        months: tpl.months !== undefined ? tpl.months : (tpl.title?.toLowerCase().includes('contado') ? 0 : 24),
        monthlyInstallment: tpl.monthlyInstallment !== undefined ? tpl.monthlyInstallment : (tpl.title?.toLowerCase().includes('contado') ? 0 : 1666.67),
        notes: tpl.conditions || ''
      },
      publicToken: generateToken()
    };

    setSelectedProforma(newProforma);
    setCurrentView('create');
  };

  // Proforma base por defecto si no existen proformas registradas
  const defaultHardcodedProforma = proformas[0] || {
    id: 'cot-1001',
    code: '#COT-1001',
    advisorName: user?.name || 'Daniel Balarezo',
    advisorPhone: user?.phone || '+51 987 654 321',
    advisorRole: user?.role || 'Asesor Comercial',
    status: 'borrador',
    currency: 'PEN',
    formattedDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
    client: {
      name: '',
      docType: 'DNI',
      docNumber: '',
      email: '',
      phone: '',
      validDays: '7 días hábiles'
    },
    items: [
      {
        id: 'item-1',
        description: 'Parcela Agrícola - Palta Hass (1,000 m²)',
        quantity: 1,
        unitPrice: 60000.00,
        discount: 0,
        total: 60000.00
      }
    ],
    includeFloorPlan: true,
    selectedPropertyId: 'parcela-palta-1000',
    subtotal: 60000.00,
    totalDiscount: 0,
    tax: 0,
    total: 60000.00,
    conditions: {
      validDays: '7 días calendarios',
      paymentType: 'financiado',
      reservation: 1000,
      initialPayment: 20000,
      balance: 40000,
      months: 24,
      monthlyInstallment: 1666.67,
      paymentMethod: 'Financiamiento Directo / Separación con S/ 1,000',
      notes: 'Modalidad: Financiado (S/ 60,000).\nSeparación: S/ 1,000.\nInicial: S/ 20,000 en 15 días.\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos.'
    },
    publicToken: 'cot-preview'
  };

  const handleDownloadPdf = async (p) => {
    await downloadProformaPdf(p || defaultHardcodedProforma);
  };

  // Config Handlers
  const handleSaveConfig = async (newConfig) => {
    await storageService.saveConfig(newConfig);
    setConfig(storageService.getConfigSync());
  };

  const handleNavigateTab = (tab) => {
    if (tab === 'proformas') setCurrentView('dashboard');
    else if (tab === 'clientes') setCurrentView('clients');
    else if (tab === 'plantillas') setCurrentView('templates');
    else if (tab === 'documentos') setCurrentView('documents');
    else if (tab === 'configuracion') setCurrentView('settings');
  };

  return (
    <div className="relative min-h-screen">
      {/* Vista Principal según estado */}
      {currentView === 'dashboard' && (
        <Dashboard
          proformas={proformas}
          advisors={advisors}
          onNewProforma={handleNewProforma}
          onEditProforma={handleEditProforma}
          onDuplicateProforma={handleDuplicateProforma}
          onChangeStatus={handleChangeStatus}
          onDownloadPdf={handleDownloadPdf}
          onDeleteProforma={handleDeleteProforma}
          onNavigateTab={handleNavigateTab}
        />
      )}

      {currentView === 'clients' && (
        <Clients
          clients={clients}
          proformas={proformas}
          onNewClient={handleNewClient}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
          onQuoteForClient={handleQuoteForClient}
          onNavigateTab={handleNavigateTab}
          onNewProforma={handleNewProforma}
          properties={properties}
          onDownloadPdf={handleDownloadPdf}
        />
      )}

      {currentView === 'templates' && (
        <Templates
          templates={templates}
          onNewTemplate={handleNewTemplate}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onUseTemplate={handleUseTemplate}
          onNavigateTab={handleNavigateTab}
          onNewProforma={handleNewProforma}
          properties={properties}
        />
      )}

      {currentView === 'documents' && (
        <Documents
          onNavigateTab={handleNavigateTab}
          onNewProforma={handleNewProforma}
        />
      )}

      {currentView === 'settings' && (
        <Settings
          config={config}
          advisors={advisors}
          onRefreshAdvisors={refreshData}
          onSaveConfig={handleSaveConfig}
          onNavigateTab={handleNavigateTab}
          onNewProforma={handleNewProforma}
        />
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <CreateProforma
          proforma={selectedProforma || defaultHardcodedProforma}
          clients={clients}
          templates={templates}
          advisors={advisors}
          onSave={handleSaveProforma}
          onBack={() => setCurrentView('dashboard')}
          properties={properties}
          onDownloadPdf={handleDownloadPdf}
        />
      )}

      {currentView === 'public' && (
        <PublicView 
          token={publicToken || 'cot-1044-janet'} 
          onDownloadPdf={handleDownloadPdf} 
        />
      )}
    </div>
  );
}
