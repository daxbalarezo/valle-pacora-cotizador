import React, { useState, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TemplateModal from '../components/templates/TemplateModal';
import { 
  Bell, 
  Search, 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Check, 
  Layers, 
  Droplet, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function Templates({
  templates = [],
  onNewTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onUseTemplate,
  onNavigateTab,
  onNewProforma,
  properties = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrop, setFilterCrop] = useState('all'); // 'all' | 'palta' | 'arandano'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar Izquierdo */}
      <Sidebar 
        currentTab="plantillas" 
        onSelectTab={onNavigateTab} 
        onNewProforma={onNewProforma} 
      />

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
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
                className="bg-white border border-slate-200/80 hover:border-[#0e692e]/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                      isPalta 
                        ? 'bg-[#eef7f2] text-[#0e692e] border border-[#c7ecd5]' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                    }`}>
                      <span>{isPalta ? '🥑' : '🫐'}</span>
                      <span>{tpl.category}</span>
                    </span>

                    {tpl.tag && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 uppercase tracking-wider">
                        {tpl.tag}
                      </span>
                    )}
                  </div>

                  {/* Título y Descripción */}
                  <h3 className="text-base font-display font-bold text-slate-900 group-hover:text-[#0e692e] transition-colors mb-1.5">
                    {tpl.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {tpl.description}
                  </p>

                  {/* Especificaciones Clave */}
                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3 mb-5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Área Total:</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{tpl.area} m²</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Parcelas:</span>
                      <span className="font-semibold text-slate-800">
                        {tpl.quantity || 1} {tpl.quantity === 2 ? 'parcelas colindantes' : 'parcela'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">PDF Oficial:</span>
                      <span className="font-medium text-[#0e692e]">
                        {tpl.includeFloorPlan ? '2 Páginas (con Plano y Riego)' : '1 Página Económica'}
                      </span>
                    </div>
                  </div>

                  {/* Inversión / Precio */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Inversión de la Parcela:
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-display font-extrabold text-slate-900 tabular-nums">
                        {formatCurrency(finalPrice, tpl.currency || 'PEN')}
                      </span>

                      {tpl.discount > 0 && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          {formatCurrency(tpl.unitPrice * (tpl.quantity || 1), tpl.currency || 'PEN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Condiciones de Pago Preview */}
                  {tpl.conditions && (
                    <div className="border-t border-slate-100 pt-3 mb-5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Forma de Pago Preconfigurada:
                      </span>
                      <p className="text-[11px] text-slate-600 italic line-clamp-2">
                        {tpl.conditions.split('\n')[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Botón Principal: Usar para Cotizar */}
                  <button
                    type="button"
                    onClick={() => onUseTemplate(tpl)}
                    className="w-full bg-[#0e692e] hover:bg-[#0a5224] text-white font-display font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-xs active:scale-[0.99]"
                  >
                    <span>Usar para Cotizar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Botones Secundarios: Editar / Eliminar */}
                  <div className="flex items-center justify-end gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(tpl, e)}
                      className="text-xs hover:text-[#0e692e] p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar la plantilla "${tpl.title}"?`)) {
                          onDeleteTemplate(tpl.id);
                        }
                      }}
                      className="text-xs hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal Crear / Editar Plantilla */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        properties={properties}
      />
    </div>
  );
}
