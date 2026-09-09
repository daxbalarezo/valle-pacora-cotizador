import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { 
  Building2, 
  CreditCard, 
  Sliders, 
  User, 
  Users, 
  MessageSquare, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  X
} from 'lucide-react';
import { formatCurrency, normalizeName, liveCapitalizeName, formatPhoneNumber } from '../utils/formatters';
import { storageService, DEFAULT_CONFIG } from '../services/storageService';

export default function Settings({
  config,
  advisors = [],
  onRefreshAdvisors,
  onSaveConfig,
  onNavigateTab,
  onNewProforma
}) {
  const [formData, setFormData] = useState(() => {
    const base = config || storageService.getConfigSync() || {};
    let advs = Array.isArray(advisors) && advisors.length > 0 ? advisors : (Array.isArray(base.advisors) ? base.advisors : []);
    advs = advs.filter(a => a.name !== 'Janet Morales' && a.name !== 'Carlos Mendoza');
    if (advs.length === 0) {
      advs = storageService.getAdvisorsSync();
    }
    return { ...base, advisors: advs };
  });
  const [activeTab, setActiveTab] = useState('company'); // 'company' | 'banks' | 'commercial' | 'advisor' | 'whatsapp'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [advisorSaveSuccess, setAdvisorSaveSuccess] = useState(false);
  const hasInitialized = useRef(false);

  // Inicializar formData una sola vez sin sobreescribir lo que el usuario esté escribiendo
  useEffect(() => {
    if (!hasInitialized.current) {
      if (advisors && advisors.length > 0) {
        const cleaned = advisors.filter(a => a.name !== 'Janet Morales' && a.name !== 'Carlos Mendoza');
        if (cleaned.length > 0) {
          setFormData(prev => ({
            ...prev,
            advisors: cleaned,
            advisor: cleaned.find(a => a.isDefault) || cleaned[0] || prev.advisor
          }));
          hasInitialized.current = true;
        }
      } else if (config && Object.keys(config).length > 0) {
        setFormData(prev => {
          const next = { ...prev, ...config };
          let advs = Array.isArray(next.advisors) ? next.advisors : [];
          advs = advs.filter(a => a.name !== 'Janet Morales' && a.name !== 'Carlos Mendoza');
          if (advs.length === 0) {
            advs = storageService.getAdvisorsSync();
          }
          next.advisors = advs;
          return next;
        });
        hasInitialized.current = true;
      }
    }
  }, [config, advisors]);

  // Sub-handlers
  const handleCompanyChange = (field, value) => {
    setFormData({
      ...formData,
      company: { ...formData.company, [field]: value }
    });
  };

  const handleAdvisorFieldChange = (index, field, value) => {
    const list = [...(formData.advisors || [])];
    list[index] = { ...list[index], [field]: value };
    const isDef = list[index].isDefault;
    const updatedAdvisor = isDef ? { ...formData.advisor, [field]: value } : formData.advisor;
    setFormData({
      ...formData,
      advisors: list,
      ...(isDef ? { advisor: updatedAdvisor } : {})
    });
  };

  const handleAdvisorPhoneChange = (index, rawValue) => {
    if (!rawValue || /^(\+?5?1?\s*|\+)$/.test(rawValue.trim())) {
      handleAdvisorFieldChange(index, 'phone', '');
      return;
    }
    const formatted = formatPhoneNumber(rawValue);
    handleAdvisorFieldChange(index, 'phone', formatted);
  };

  const handleAdvisorFieldBlur = (index, field, value) => {
    const list = [...(formData.advisors || [])];
    list[index] = { ...list[index], [field]: value };
    const isDef = list[index].isDefault;
    const updatedAdvisor = isDef ? { ...formData.advisor, [field]: value } : formData.advisor;
    setFormData({
      ...formData,
      advisors: list,
      ...(isDef ? { advisor: updatedAdvisor } : {})
    });
  };

  const handleAddAdvisor = () => {
    const list = formData.advisors || [];
    const newAdvisor = {
      id: `advisor-${Date.now()}`,
      name: '',
      role: 'Asesor Comercial Especializado',
      phone: '+51 ',
      email: '',
      isDefault: list.length === 0,
      active: true
    };
    setFormData(prev => ({
      ...prev,
      advisors: [...(prev.advisors || []), newAdvisor]
    }));
  };

  const handleDeleteAdvisor = async (index) => {
    const list = formData.advisors || [];
    if (list.length <= 1) {
      alert('Debe existir al menos un asesor comercial registrado.');
      return;
    }
    const target = list[index];
    if (target?.id) {
      try {
        await storageService.deleteAdvisor(target.id);
      } catch (e) {}
    }
    const filtered = list.filter((_, i) => i !== index);
    let primary = undefined;
    if (target.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
      primary = {
        name: filtered[0].name,
        role: filtered[0].role,
        phone: filtered[0].phone,
        email: filtered[0].email
      };
    }
    const updated = {
      ...formData,
      advisors: filtered,
      ...(primary ? { advisor: primary } : {})
    };
    setFormData(updated);

    if (onSaveConfig) {
      await onSaveConfig(updated);
    } else {
      await storageService.saveConfig(updated);
    }

    if (onRefreshAdvisors) {
      onRefreshAdvisors();
    }

    setAdvisorSaveSuccess(true);
    setTimeout(() => setAdvisorSaveSuccess(false), 2500);
  };

  const handleSetDefaultAdvisor = (index) => {
    const list = (formData.advisors || []).map((adv, i) => ({
      ...adv,
      isDefault: i === index
    }));
    const primary = {
      name: list[index].name,
      role: list[index].role,
      phone: list[index].phone,
      email: list[index].email
    };
    setFormData(prev => ({
      ...prev,
      advisors: list,
      advisor: primary
    }));
  };

  const handleSaveAdvisorsTab = async () => {
    const list = formData.advisors || [];
    const validAdvisors = list.filter(a => a && a.name && a.name.trim());
    if (validAdvisors.length === 0) {
      alert('Por favor, ingresa el nombre de al menos un asesor comercial antes de guardar.');
      return;
    }

    if (!validAdvisors.some(a => a.isDefault)) {
      validAdvisors[0].isDefault = true;
    }
    const primaryAdvisor = validAdvisors.find(a => a.isDefault) || validAdvisors[0];

    const updated = {
      ...formData,
      advisors: validAdvisors,
      advisor: primaryAdvisor
    };
    setFormData(updated);

    // Persistir directamente cada asesor en Firestore
    try {
      for (const adv of validAdvisors) {
        await storageService.saveAdvisor(adv);
      }
    } catch (err) {
      console.warn('[Settings] Error guardando asesores en Firestore:', err);
    }

    if (onSaveConfig) {
      await onSaveConfig(updated);
    } else {
      await storageService.saveConfig(updated);
    }

    if (onRefreshAdvisors) {
      onRefreshAdvisors();
    }

    setAdvisorSaveSuccess(true);
    setTimeout(() => setAdvisorSaveSuccess(false), 3000);
  };

  const handleCommercialChange = (field, value) => {
    setFormData({
      ...formData,
      commercialDefaults: { ...formData.commercialDefaults, [field]: value }
    });
  };

  const handleBankAccountChange = (index, field, value) => {
    const updated = [...(formData.bankAccounts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, bankAccounts: updated });
  };

  const handleAddBankAccount = () => {
    const newAccount = {
      id: `bank-${Date.now()}`,
      bank: 'Nuevo Banco',
      currency: 'Soles (PEN)',
      accountType: 'Cuenta Corriente',
      accountNumber: '000-00000000-0-00',
      cci: '000-000-000000000000-00',
      holder: formData.company?.name || 'Roble Constructora del Peru SAC'
    };
    setFormData({
      ...formData,
      bankAccounts: [...(formData.bankAccounts || []), newAccount]
    });
  };

  const handleDeleteBankAccount = (index) => {
    const updated = formData.bankAccounts.filter((_, i) => i !== index);
    setFormData({ ...formData, bankAccounts: updated });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    await onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Simulación de vista previa de mensaje WhatsApp
  const previewWhatsAppMessage = () => {
    const template = formData.whatsappMessageTemplate || '';
    return template
      .replace('{cliente}', 'Janet Mendoza')
      .replace('{asesor}', formData.advisor?.name || 'Daniel Balarezo')
      .replace('{codigo}', '#COT-1044')
      .replace('{propiedad}', 'Parcela Palta Hass (1,000 m²)')
      .replace('{monto}', 'S/ 60,000.00')
      .replace('{inicial}', 'S/ 20,000.00')
      .replace('{meses}', '36')
      .replace('{cuota}', 'S/ 1,111.11')
      .replace('{enlace}', '');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar Izquierdo */}
      <Sidebar 
        currentTab="configuracion" 
        onSelectTab={onNavigateTab} 
        onNewProforma={onNewProforma} 
      />

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Configuración del Cotizador
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Parámetros de membrete oficial, cuentas bancarias para separación y perfil de asesor.
            </p>
          </div>

          {/* Botón Guardar Cambios */}
          <button
            type="button"
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl font-display font-semibold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-[0.99] ${
              savedSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#0e692e] hover:bg-[#0a5224] text-white'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>¡Cambios Guardados!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>

        {/* Pestañas de Navegación Interna */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {[
            { id: 'company', label: 'Empresa & Membrete', icon: Building2 },
            { id: 'banks', label: 'Cuentas Bancarias', icon: CreditCard },
            { id: 'commercial', label: 'Parámetros de Cotización', icon: Sliders },
            { id: 'advisor', label: 'Equipo de Asesores', icon: Users },
            { id: 'whatsapp', label: 'Plantilla WhatsApp', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0e692e] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido de la Sección Seleccionada */}
        <div className="max-w-4xl space-y-6">
          {/* TAB 1: EMPRESA Y MEMBRETE */}
          {activeTab === 'company' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  Membrete Oficial de la Empresa
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta información legal y de contacto aparece en la cabecera del PDF oficial y en las cotizaciones web.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Razón Social Legal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company?.name || ''}
                    onChange={(e) => handleCompanyChange('name', e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nombre Comercial del Proyecto <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company?.brandName || ''}
                    onChange={(e) => handleCompanyChange('brandName', e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    RUC de la Constructora <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company?.ruc || ''}
                    onChange={(e) => handleCompanyChange('ruc', e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Teléfono Central de Ventas
                  </label>
                  <input
                    type="text"
                    value={formData.company?.phone || ''}
                    onChange={(e) => handleCompanyChange('phone', e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Dirección Principal (Oficina Comercial)
                  </label>
                  <input
                    type="text"
                    value={formData.company?.address || ''}
                    onChange={(e) => handleCompanyChange('address', e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Correo Electrónico Oficial
                  </label>
                  <input
                    type="email"
                    value={formData.company?.email || ''}
                    onChange={(e) => handleCompanyChange('email', e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sitio Web Oficial
                  </label>
                  <input
                    type="text"
                    value={formData.company?.website || ''}
                    onChange={(e) => handleCompanyChange('website', e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUENTAS BANCARIAS */}
          {activeTab === 'banks' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-display font-bold text-slate-900">
                    Cuentas Bancarias Oficiales
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cuentas autorizadas donde los clientes realizan el abono de separación de S/ 1,000 o inicial.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddBankAccount}
                  className="bg-[#eef7f2] hover:bg-[#d8eedf] text-[#0e692e] text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Cuenta</span>
                </button>
              </div>

              <div className="space-y-4">
                {(formData.bankAccounts || []).map((acc, index) => (
                  <div 
                    key={acc.id || index}
                    className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 relative space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#0e692e]" />
                        Cuenta Bancaria #{index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteBankAccount(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar cuenta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Entidad Financiera (Banco)
                        </label>
                        <input
                          type="text"
                          value={acc.bank}
                          onChange={(e) => handleBankAccountChange(index, 'bank', e.target.value)}
                          placeholder="Ej. Banco de Crédito del Perú (BCP)"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Moneda y Tipo de Cuenta
                        </label>
                        <input
                          type="text"
                          value={acc.currency}
                          onChange={(e) => handleBankAccountChange(index, 'currency', e.target.value)}
                          placeholder="Soles (PEN) - Cuenta Corriente"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Número de Cuenta
                        </label>
                        <input
                          type="text"
                          value={acc.accountNumber}
                          onChange={(e) => handleBankAccountChange(index, 'accountNumber', e.target.value)}
                          placeholder="305-98765432-0-12"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Código de Cuenta Interbancario (CCI)
                        </label>
                        <input
                          type="text"
                          value={acc.cci}
                          onChange={(e) => handleBankAccountChange(index, 'cci', e.target.value)}
                          placeholder="002-305-0098765432012-45"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Titular de la Cuenta
                        </label>
                        <input
                          type="text"
                          value={acc.holder}
                          onChange={(e) => handleBankAccountChange(index, 'holder', e.target.value)}
                          placeholder="Roble Constructora del Peru SAC"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PARÁMETROS COMERCIALES */}
          {activeTab === 'commercial' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  Parámetros Comerciales Predeterminados
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Valores que se aplicarán automáticamente al crear una nueva proforma.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Moneda Predeterminada
                  </label>
                  <select
                    value={formData.commercialDefaults?.currency || 'PEN'}
                    onChange={(e) => handleCommercialChange('currency', e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                  >
                    <option value="PEN">Soles (PEN - S/)</option>
                    <option value="USD">Dólares (USD - $)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Validez de Oferta (Días)
                  </label>
                  <input
                    type="number"
                    value={formData.commercialDefaults?.validDays || 7}
                    onChange={(e) => handleCommercialChange('validDays', Number(e.target.value) || 7)}
                    placeholder="7"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Separación Sugerida (S/)
                  </label>
                  <input
                    type="number"
                    value={formData.commercialDefaults?.separationAmount || 1000}
                    onChange={(e) => handleCommercialChange('separationAmount', Number(e.target.value) || 1000)}
                    placeholder="1000"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] tabular-nums font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Términos y Condiciones Legales Predeterminadas
                </label>
                <textarea
                  rows={4}
                  value={formData.commercialDefaults?.defaultNotes || ''}
                  onChange={(e) => handleCommercialChange('defaultNotes', e.target.value)}
                  placeholder="Forma de pago: S/ 1,000 de separación..."
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 4: EQUIPO DE ASESORES */}
          {activeTab === 'advisor' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-display font-bold text-slate-900">
                    Equipo de Asesores Comerciales
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gestiona los asesores de la constructora. Al cotizar podrás elegir quién emite la proforma, apareciendo en la firma y WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAdvisor}
                  className="bg-[#0e692e] hover:bg-[#0a5224] text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.99] self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Agregar Asesor</span>
                </button>
              </div>

              <div className="space-y-4">
                {(formData.advisors || []).map((adv, index) => {
                  const initials = (adv.name || 'A')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={adv.id || index}
                      className={`border rounded-2xl p-5 transition-all ${
                        adv.isDefault
                          ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                          : 'border-slate-200 bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0e692e]/15 text-[#0e692e] flex items-center justify-center font-bold text-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {adv.name || 'Asesor Comercial'}
                              </span>
                              {adv.isDefault ? (
                                <span className="bg-[#0e692e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" /> Principal / Predeterminado
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultAdvisor(index)}
                                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                                >
                                  Establecer como Principal
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{adv.role}</span>
                          </div>
                        </div>

                        {(formData.advisors || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAdvisor(index)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors text-xs flex items-center gap-1"
                            title="Eliminar asesor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Nombre Completo del Asesor
                          </label>
                          <input
                            type="text"
                            value={adv.name || ''}
                            onChange={(e) => handleAdvisorFieldChange(index, 'name', liveCapitalizeName(e.target.value))}
                            onBlur={(e) => {
                              const norm = normalizeName(e.target.value);
                              handleAdvisorFieldChange(index, 'name', norm);
                              handleAdvisorFieldBlur(index, 'name', norm);
                            }}
                            placeholder="Ej. Daniel Balarezo"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Cargo / Rol en la Constructora
                          </label>
                          <input
                            type="text"
                            value={adv.role || ''}
                            onChange={(e) => handleAdvisorFieldChange(index, 'role', liveCapitalizeName(e.target.value))}
                            onBlur={(e) => {
                              const norm = normalizeName(e.target.value);
                              handleAdvisorFieldChange(index, 'role', norm);
                              handleAdvisorFieldBlur(index, 'role', norm);
                            }}
                            placeholder="Ej. Asesor Comercial Especializado"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Teléfono Móvil / WhatsApp de Contacto
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={adv.phone || ''}
                              onChange={(e) => handleAdvisorPhoneChange(index, e.target.value)}
                              onBlur={(e) => {
                                const fmt = formatPhoneNumber(e.target.value);
                                handleAdvisorFieldChange(index, 'phone', fmt);
                                handleAdvisorFieldBlur(index, 'phone', fmt);
                              }}
                              placeholder="Ej. +51 987 654 321"
                              className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                            />
                            {adv.phone && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleAdvisorFieldChange(index, 'phone', '');
                                  handleAdvisorFieldBlur(index, 'phone', '');
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Borrar número para escribir uno nuevo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Correo Electrónico del Asesor
                          </label>
                          <input
                            type="email"
                            value={adv.email || ''}
                            onChange={(e) => handleAdvisorFieldChange(index, 'email', e.target.value)}
                            onBlur={(e) => handleAdvisorFieldBlur(index, 'email', e.target.value)}
                            placeholder="Ej. asesor@vallepacora.pe"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra de Guardado del Equipo de Asesores */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  {advisorSaveSuccess ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      ¡Equipo de asesores sincronizado y guardado con éxito!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Los asesores configurados estarán disponibles de inmediato al emitir cotizaciones.
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSaveAdvisorsTab}
                  className="bg-[#0e692e] hover:bg-[#0a5224] text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer self-end sm:self-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Equipo de Asesores</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PLANTILLA WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-display font-bold text-slate-900">
                  Plantilla de Mensaje de WhatsApp
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mensaje preconfigurado que se abrirá en WhatsApp al compartir cualquier proforma con un cliente.
                </p>
              </div>

              {/* Variables dinámicas disponibles */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Variables dinámicas disponibles (haz clic para copiar):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: '{cliente}', desc: 'Nombre del Cliente' },
                    { tag: '{asesor}', desc: 'Nombre del Asesor' },
                    { tag: '{codigo}', desc: 'Código (#COT-1044)' },
                    { tag: '{propiedad}', desc: 'Nombre del Lote' },
                    { tag: '{monto}', desc: 'Total en Soles' }
                  ].map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          whatsappMessageTemplate: (formData.whatsappMessageTemplate || '') + ' ' + v.tag
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
                      title={v.desc}
                    >
                      <span className="font-bold text-[#0e692e]">{v.tag}</span>
                      <span className="text-[10px] text-slate-500">({v.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor del Mensaje */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cuerpo del Mensaje WhatsApp
                </label>
                <textarea
                  rows={5}
                  value={formData.whatsappMessageTemplate || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappMessageTemplate: e.target.value })}
                  placeholder="Hola {cliente}, le saluda {asesor} de Valle Pacora..."
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] resize-none leading-relaxed font-mono"
                />
              </div>

              {/* Previsualización en Vivo de WhatsApp */}
              <div className="bg-[#EFEAE2] p-5 rounded-2xl border border-slate-200">
                <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Vista Previa Simulada (Cómo lo verá el cliente en WhatsApp):
                </span>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-md text-xs text-slate-800 leading-relaxed whitespace-pre-line border border-emerald-100">
                  {previewWhatsAppMessage()}
                  <span className="block text-right text-[10px] text-slate-400 mt-2">
                    12:30 p. m. ✓✓
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
