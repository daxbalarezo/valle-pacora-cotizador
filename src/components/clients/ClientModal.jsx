import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Building, DollarSign, FileText } from 'lucide-react';
import { normalizeName, liveCapitalizeName, formatPhoneNumber } from '../../utils/formatters';

export default function ClientModal({
  isOpen,
  onClose,
  client = null,
  onSave,
  properties = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    docType: 'DNI',
    docNumber: '',
    phone: '',
    email: '',
    city: 'Chiclayo',
    interestProject: 'Valle Pacora - Parcelas Agrícolas Ampliación 2 Etapa N° 154',
    budget: 60000,
    notes: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        docType: client.docType || 'DNI',
        docNumber: client.docNumber || '',
        phone: client.phone || '',
        email: client.email || '',
        city: client.city || 'Chiclayo',
        interestProject: client.interestProject || 'Valle Pacora - Parcelas Agrícolas Ampliación 2 Etapa N° 154',
        budget: client.budget || 60000,
        notes: client.notes || ''
      });
    } else {
      setFormData({
        name: '',
        docType: 'DNI',
        docNumber: '',
        phone: '+51 ',
        email: '',
        city: 'Lima',
        interestProject: 'Valle Pacora - Parcelas Agrícolas Ampliación 2 Etapa N° 154',
        budget: 60000,
        notes: ''
      });
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...(client ? { id: client.id, createdAt: client.createdAt } : {}),
      ...formData,
      name: normalizeName(formData.name),
      phone: formatPhoneNumber(formData.phone),
      budget: Number(formData.budget) || 0
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
              {client ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingresa los datos de contacto y requerimiento del prospecto.
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
          {/* Nombre Completo / Razón Social */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nombre Completo / Razón Social <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: liveCapitalizeName(e.target.value) })}
                onBlur={(e) => setFormData({ ...formData, name: normalizeName(e.target.value) })}
                placeholder="Ej. Janet Mendoza / Inversiones SAC"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
              />
            </div>
          </div>

          {/* Documento Tipo y Número */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tipo Doc.
              </label>
              <select
                value={formData.docType}
                onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">C.E.</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Número de Documento
              </label>
              <input
                type="text"
                value={formData.docNumber}
                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                placeholder="Ej. 45892143 ó 20601234567"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-mono"
              />
            </div>
          </div>

          {/* Contacto: Teléfono y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Teléfono / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  onBlur={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  placeholder="+51 984 123 789"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cliente@ejemplo.pe"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Ciudad de Origen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ciudad de Origen
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ej. Lima, Chiclayo, Tumbes..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
              />
            </div>
          </div>

          {/* Proyecto de Interés y Presupuesto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Proyecto / Unidad de Interés
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.interestProject}
                  onChange={(e) => setFormData({ ...formData, interestProject: e.target.value })}
                  placeholder="Ej. Parcela Agrícola 154"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Presupuesto Estimado (S/)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="60000"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Notas de Seguimiento Comercial */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bitácora y Notas Comerciales
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ej. Interesada en visita in situ a fin de mes. Coordinar videollamada para mostrar avances..."
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all resize-none leading-relaxed"
            />
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
              {client ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
