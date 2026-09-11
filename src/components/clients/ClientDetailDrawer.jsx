import React from 'react';
import { X, Phone, Mail, MapPin, Building, DollarSign, Calendar, FileText, ArrowRight, MessageCircle, ExternalLink, Download } from 'lucide-react';
import { formatCurrency, formatDate, getWhatsAppCleanPhone, formatPhoneNumber } from '../../utils/formatters';

export default function ClientDetailDrawer({
  isOpen,
  onClose,
  client,
  proformas = [],
  onQuoteClient,
  onEditClient,
  onDownloadPdf
}) {
  if (!isOpen || !client) return null;

  // Filtrar proformas asociadas a este cliente
  const clientProformas = proformas.filter(p => 
    p.client?.docNumber === client.docNumber ||
    p.client?.name?.toLowerCase().trim() === client.name?.toLowerCase().trim()
  );

  const totalQuoted = clientProformas.reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  const getStatusBadge = (hasQuotes) => {
    if (hasQuotes) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#eef7f2] text-[#0e692e] border border-[#c7ecd5] inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0e692e]"></span>
          Cotizado
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Sin Cotizar
      </span>
    );
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = getWhatsAppCleanPhone(client.phone);
    const message = encodeURIComponent(
      `Hola ${client.name}, le saluda Daniel Balarezo de Valle Pacora. Le contacto respecto a su interés en nuestro proyecto ${client.interestProject || 'Valle Pacora'}. ¿Cómo le va?`
    );
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${message}` 
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const getInitials = (name) => {
    if (!name) return 'CL';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0e692e] text-white flex items-center justify-center font-display font-bold text-base shadow-sm">
              {getInitials(client.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-bold text-slate-900 leading-tight">
                  {client.name}
                </h2>
                {getStatusBadge(clientProformas.length > 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {client.docType}: {client.docNumber || 'No especificado'} • {client.city || 'Perú'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Cotizaciones Emitidas
              </span>
              <span className="text-xl font-display font-bold text-slate-900 tabular-nums">
                {clientProformas.length} {clientProformas.length === 1 ? 'proforma' : 'proformas'}
              </span>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Monto Total Cotizado
              </span>
              <span className="text-xl font-display font-bold text-[#0e692e] tabular-nums">
                {formatCurrency(totalQuoted).replace('.00', '')}
              </span>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Datos de Contacto
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-[#0e692e]" /> Teléfono:
                </span>
                <span className="font-mono font-medium text-slate-800">{client.phone || 'No registrado'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-[#0e692e]" /> Correo:
                </span>
                <span className="font-medium text-slate-800">{client.email || 'No registrado'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#0e692e]" /> Ubicación:
                </span>
                <span className="font-medium text-slate-800">{client.city || 'No registrada'}</span>
              </div>
            </div>
          </div>

          {/* Requerimiento Inmobiliario */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Interés Inmobiliario
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Proyecto / Unidad:</span>
                <span className="font-medium text-slate-800">{client.interestProject || 'Valle Pacora'}</span>
              </div>

              {client.budget > 0 && (
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Presupuesto Referencial:</span>
                  <span className="font-display font-bold text-slate-900 tabular-nums">
                    {formatCurrency(client.budget)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bitácora / Notas Comerciales */}
          {client.notes && (
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-xs">
              <span className="block font-bold text-amber-800 mb-1.5 uppercase tracking-wider text-[10px]">
                Notas y Acuerdos de Seguimiento
              </span>
              <p className="text-amber-900/90 leading-relaxed whitespace-pre-line">
                {client.notes}
              </p>
            </div>
          )}

          {/* Historial de Cotizaciones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Historial de Cotizaciones ({clientProformas.length})
              </h3>

              <button
                type="button"
                onClick={() => onQuoteClient(client)}
                className="text-xs font-semibold text-[#0e692e] hover:underline flex items-center gap-1"
              >
                + Nueva Proforma
              </button>
            </div>

            {clientProformas.length === 0 ? (
              <div className="bg-[#F8FAFC] border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">Aún no se han emitido cotizaciones a este cliente</p>
                <button
                  type="button"
                  onClick={() => onQuoteClient(client)}
                  className="mt-3 inline-flex items-center gap-1.5 bg-[#0e692e] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#0a5224] transition-colors shadow-sm"
                >
                  Crear Primera Cotización
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clientProformas.map((p) => (
                  <div 
                    key={p.id}
                    className="bg-white border border-slate-200/80 hover:border-[#0e692e]/40 rounded-xl p-3.5 flex items-center justify-between transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-xs text-slate-900">{p.code}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'aprobada' ? 'bg-emerald-50 text-emerald-700' :
                          p.status === 'enviada' ? 'bg-[#eef7f2] text-[#0e692e]' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {p.formattedDate || formatDate(p.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-xs text-slate-900 tabular-nums">
                        {formatCurrency(p.total, p.currency)}
                      </span>

                      {onDownloadPdf && (
                        <button
                          type="button"
                          onClick={() => onDownloadPdf(p)}
                          title="Descargar PDF"
                          className="p-1.5 text-slate-400 hover:text-[#0e692e] hover:bg-[#eef7f2] rounded-lg transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Drawer Buttons */}
        <div className="p-5 border-t border-slate-100 bg-[#F8FAFC] flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-display font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Directo</span>
          </button>

          <button
            type="button"
            onClick={() => onQuoteClient(client)}
            className="flex-1 bg-[#0e692e] hover:bg-[#0a5224] text-white font-display font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Cotizar Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
