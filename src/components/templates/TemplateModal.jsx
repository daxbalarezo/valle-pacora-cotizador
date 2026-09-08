import React, { useState, useEffect } from 'react';
import { X, Sprout, DollarSign, FileText, Check, Layers, Tag } from 'lucide-react';

export default function TemplateModal({
  isOpen,
  onClose,
  template = null,
  onSave,
  properties = []
}) {
  const [formData, setFormData] = useState({
    title: '',
    crop: 'palta', // 'palta' | 'arandano'
    area: 1000,
    quantity: 1,
    unitPrice: 60000,
    discount: 0,
    propertyId: '',
    conditions: 'Forma de pago: S/ 1,000 de separación y 60% de inicial máximo en 15 días.\nTiempo de validez de la proforma 7 días calendarios.',
    includeFloorPlan: true,
    tag: 'Más Vendido'
  });

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title || '',
        crop: template.crop || 'palta',
        area: template.area || 1000,
        quantity: template.quantity || 1,
        unitPrice: template.unitPrice || 60000,
        discount: template.discount || 0,
        propertyId: template.propertyId || properties[0]?.id || '',
        conditions: template.conditions || '',
        includeFloorPlan: template.includeFloorPlan ?? true,
        tag: template.tag || 'Más Vendido'
      });
    } else {
      setFormData({
        title: 'Parcela Agrícola - Palta Hass (1,000 m²)',
        crop: 'palta',
        area: 1000,
        quantity: 1,
        unitPrice: 60000,
        discount: 0,
        propertyId: properties[0]?.id || '',
        conditions: 'Forma de pago: S/ 1,000 de separación y 60% de inicial máximo en 15 días.\nTiempo de validez de la proforma 7 días calendarios.',
        includeFloorPlan: true,
        tag: 'Más Vendido'
      });
    }
  }, [template, isOpen, properties]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const unitPrice = Number(formData.unitPrice) || 0;
    const quantity = Number(formData.quantity) || 1;
    const discount = Number(formData.discount) || 0;
    const total = Math.max(0, (unitPrice * quantity) - discount);

    onSave({
      ...(template ? { id: template.id, createdAt: template.createdAt } : {}),
      ...formData,
      unitPrice,
      quantity,
      discount,
      total,
      category: formData.crop === 'palta' ? 'Palta Hass' : 'Arándanos'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900">
              {template ? 'Editar Plantilla de Cotización' : 'Nueva Plantilla de Cotización'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configura un modelo de parcela de Palta Hass o Arándanos para cotizar en segundos.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Cultivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Cultivo Agrícola <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  crop: 'palta',
                  unitPrice: formData.unitPrice || 60000,
                  title: formData.title || 'Parcela Agrícola - Palta Hass (1,000 m²)'
                })}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  formData.crop === 'palta'
                    ? 'border-[#0e692e] bg-[#eef7f2] text-[#0e692e]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-[#F8FAFC]'
                }`}
              >
                <span className="text-2xl">🥑</span>
                <div>
                  <span className="text-xs font-bold block">Palta Hass</span>
                  <span className="text-[10px] text-slate-500">Variedad de exportación</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  crop: 'arandano',
                  unitPrice: formData.unitPrice === 60000 ? 65000 : formData.unitPrice,
                  title: formData.title.includes('Palta') ? 'Parcela Agrícola - Arándanos (1,000 m²)' : formData.title
                })}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  formData.crop === 'arandano'
                    ? 'border-[#0e692e] bg-[#eef7f2] text-[#0e692e]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-[#F8FAFC]'
                }`}
              >
                <span className="text-2xl">🫐</span>
                <div>
                  <span className="text-xs font-bold block">Arándanos</span>
                  <span className="text-[10px] text-slate-500">Alta densidad y riego</span>
                </div>
              </button>
            </div>
          </div>

          {/* Título de la Plantilla */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Título de la Plantilla <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej. Parcela Agrícola - Palta Hass (1,000 m²)"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
            />
          </div>

          {/* Área, Cantidad y Precio Unitario */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Área Total (m²)
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) || 0 })}
                placeholder="1000"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                N° de Parcelas
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 1 })}
                placeholder="1"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Precio Unitario (S/) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) || 0 })}
                placeholder="60000"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all tabular-nums font-semibold"
              />
            </div>
          </div>

          {/* Descuento y Etiqueta Comercial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Descuento Comercial (S/)
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) || 0 })}
                placeholder="0"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Etiqueta / Distintivo
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Ej. Más Vendido, Pronto Pago..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
              />
            </div>
          </div>

          {/* Condiciones Comerciales Predeterminadas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Condiciones Comerciales y Forma de Pago
            </label>
            <textarea
              rows={3}
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              placeholder="Ej. Forma de pago: S/ 1,000 de separación y 60% de inicial en 15 días..."
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Switch Incluir Ficha Técnica y Plano en el PDF */}
          <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Incluir Ficha Técnica y Plano en el PDF (2 Páginas)
              </span>
              <span className="text-[10px] text-slate-500 block">
                Adjunta automáticamente la página de plano y especificaciones de riego al cotizar.
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includeFloorPlan}
                onChange={(e) => setFormData({ ...formData, includeFloorPlan: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0e692e]"></div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0e692e] hover:bg-[#0a5224] text-white text-xs font-display font-semibold transition-colors shadow-sm"
            >
              {template ? 'Guardar Cambios' : 'Crear Plantilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
