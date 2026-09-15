import React, { useState, useMemo } from 'react';
import TemplateModal from '../components/templates/TemplateModal';
import { 
  Bell, 
  Search, 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Check,
  CheckCircle2, 
  Layers, 
  Droplet, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatCurrency, generateToken } from '../utils/formatters';
import { useGlobalContext } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Templates() {
  const {
    templates = [],
    properties = [],
    proformas = [],
    advisors = [],
    config,
    handleNewTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
    setSelectedProforma
  } = useGlobalContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrop, setFilterCrop] = useState('all'); // 'all' | 'palta' | 'arandano'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const onUseTemplate = (tpl) => {
    const activeAdvisors = (advisors && advisors.length > 0) ? advisors : [];
    const defaultAdvisor = activeAdvisors.find(a => a.isDefault) || activeAdvisors[0] || {
      id: 'asesor-1',
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
    navigate('/crear');
  };

  // Filtrado de plantillas
  const filteredTemplates = useMemo(() => {
    return templates.filter(tpl => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        tpl.title?.toLowerCase().includes(q) ||
        tpl.description?.toLowerCase().includes(q) ||
        tpl.category?.toLowerCase().includes(q) ||
        tpl.tag?.toLowerCase().includes(q)
      );

      let matchesCrop = true;
      if (filterCrop === 'palta') matchesCrop = tpl.crop === 'palta';
      else if (filterCrop === 'arandano') matchesCrop = tpl.crop === 'arandano';

      return matchesSearch && matchesCrop;
    });
  }, [templates, searchQuery, filterCrop]);

  // Métricas
  const metrics = useMemo(() => {
    const total = templates.length;
    const paltaCount = templates.filter(t => t.crop === 'palta').length;
    const arandanoCount = templates.filter(t => t.crop === 'arandano').length;

    return {
      total: total,
      paltaCount: paltaCount,
      arandanoCount: arandanoCount
    };
  }, [templates]);

  const handleOpenNewModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl, e) => {
    if (e) e.stopPropagation();
    setEditingTemplate(tpl);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (templateData) => {
    if (editingTemplate) {
      await onEditTemplate(templateData);
    } else {
      await onNewTemplate(templateData);
    }
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="w-full">
      {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Plantillas de Cotización - Parcelas Agrícolas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Modelos preconfigurados de Palta Hass y Arándanos para emitir cotizaciones oficiales en 15 segundos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plantilla por cultivo..."
                className="w-72 bg-white sm:bg-[#F8FAFC] border border-slate-200/90 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
              />
            </div>

            {/* Botón + Nueva Plantilla */}
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="bg-[#0e692e] hover:bg-[#0a5224] text-white font-display font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nueva Plantilla</span>
            </button>

            {/* Notificaciones */}
            <button 
              type="button" 
              className="w-10 h-10 rounded-full bg-[#FFFBEB] hover:bg-amber-100 text-[#D97706] flex items-center justify-center border border-amber-200/50 transition-colors"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4 fill-amber-500 stroke-amber-600" />
            </button>
          </div>
        </div>

        {/* 3 Tarjetas de Métricas Superiores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Plantillas */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Modelos de Parcelas Configurados
            </span>
            <span className="block text-2xl font-display font-bold text-slate-900 tracking-tight tabular-nums">
              {metrics.total} plantillas
            </span>
          </div>

          {/* Card 2: Palta Hass */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Modelos Palta Hass
            </span>
            <span className="block text-2xl font-display font-bold text-[#0e692e] tracking-tight tabular-nums flex items-center gap-2">
              <span>🥑 {metrics.paltaCount}</span>
              <span className="text-xs font-normal text-slate-400">opciones</span>
            </span>
          </div>

          {/* Card 3: Arándanos */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Modelos Arándanos
            </span>
            <span className="block text-2xl font-display font-bold text-indigo-700 tracking-tight tabular-nums flex items-center gap-2">
              <span>🫐 {metrics.arandanoCount}</span>
              <span className="text-xs font-normal text-slate-400">opciones</span>
            </span>
          </div>
        </div>

        {/* Filtros tipo píldora (Solo Cultivos Reales de Valle Pacora) */}
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFilterCrop('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterCrop === 'all'
                ? 'bg-[#0e692e] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Todas las Parcelas
          </button>

          <button
            type="button"
            onClick={() => setFilterCrop('palta')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterCrop === 'palta'
                ? 'bg-[#0e692e] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <span>🥑</span>
            <span>Palta Hass</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCrop('arandano')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterCrop === 'arandano'
                ? 'bg-[#0e692e] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            <span>🫐</span>
            <span>Arándanos</span>
          </button>
        </div>

        {/* Grid de Tarjetas de Plantillas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => {
            const finalPrice = tpl.total || (tpl.unitPrice * (tpl.quantity || 1)) - (tpl.discount || 0);
            const isPalta = tpl.crop === 'palta';

            return (
              <div
                key={tpl.id}
                className={`bg-white rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all flex flex-col group relative overflow-hidden border ${isPalta ? 'border-[#c7ecd5] hover:border-[#0e692e]/40' : 'border-indigo-100 hover:border-indigo-400/40'}`}
              >
                {/* Colored Top Accent */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isPalta ? 'bg-[#0e692e]' : 'bg-indigo-600'}`}></div>

                <div className="p-5 flex flex-col h-full justify-between">
                  <div>
                    {/* Header: Title and Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2 pt-1">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isPalta 
                            ? 'bg-[#eef7f2] text-[#0e692e]' 
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          <span>{isPalta ? '🥑' : '🫐'}</span>
                          <span>{tpl.category}</span>
                        </span>
                        {tpl.tag && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wider">
                            {tpl.tag}
                          </span>
                        )}
                      </div>
                      
                      {/* Quick Actions (Edit / Delete) -> Always visible or on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(tpl, e)}
                          className="p-1.5 text-slate-400 hover:text-[#0e692e] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar Plantilla"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la plantilla "${tpl.title}"?`)) {
                              handleDeleteTemplate(tpl.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar Plantilla"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-[#0e692e] transition-colors mb-2 leading-tight">
                      {tpl.title}
                    </h3>

                    {/* Price Hero Section */}
                    <div className="mb-5">
                      <div className="flex items-end gap-1.5">
                        <span className="text-3xl font-display font-extrabold text-slate-900 tabular-nums tracking-tight">
                          {formatCurrency(finalPrice, tpl.currency || 'PEN')}
                        </span>
                      </div>
                      {tpl.discount > 0 && (
                        <span className="text-xs text-slate-400 font-medium line-through tabular-nums mt-0.5 block">
                          Precio base: {formatCurrency(tpl.unitPrice * (tpl.quantity || 1), tpl.currency || 'PEN')}
                        </span>
                      )}
                    </div>

                    {/* Features List with checkmarks */}
                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0e692e] mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-600 leading-snug">
                          <strong className="text-slate-800 font-semibold">{tpl.area} m²</strong> de área total
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0e692e] mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-600 leading-snug">
                          <strong className="text-slate-800 font-semibold">{tpl.quantity || 1}</strong> {tpl.quantity === 2 ? 'parcelas colindantes' : 'parcela'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0e692e] mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-600 leading-snug">
                          {tpl.includeFloorPlan ? 'Formato PDF detallado (2 págs)' : 'Formato PDF económico (1 pág)'}
                        </span>
                      </div>
                      {tpl.conditions && (
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0e692e] mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-600 leading-snug italic line-clamp-2">
                            {tpl.conditions.split('\n')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Call to Action */}
                  <button
                    type="button"
                    onClick={() => onUseTemplate(tpl)}
                    className="w-full bg-slate-900 hover:bg-[#0e692e] text-white font-display font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-xs active:scale-[0.98]"
                  >
                    <span>Usar para Cotizar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      {/* Modal Crear / Editar Plantilla */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={async (tplData) => {
          if (editingTemplate) {
            await handleEditTemplate(tplData);
          } else {
            await handleNewTemplate(tplData);
          }
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        properties={properties}
      />
    </div>
  );
}
