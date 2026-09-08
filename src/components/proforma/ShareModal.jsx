import React, { useState } from 'react';
import { MessageSquare, FileText, Check, Copy } from 'lucide-react';
import { formatCurrency, formatPhoneNumber, getWhatsAppCleanPhone } from '../../utils/formatters';
import { storageService } from '../../services/storageService';

export default function ShareModal({ 
  isOpen, 
  onClose, 
  proforma, 
  onDownloadPdf 
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !proforma) return null;

  const publicUrl = `${window.location.origin}/p/${proforma.publicToken || proforma.code.replace('#', '').toLowerCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const config = storageService.getConfigSync();
    const clientName = proforma.client?.name || 'Estimado(a) cliente';
    const advisorName = proforma.advisorName || config?.advisor?.name || 'Daniel Balarezo';
    const totalFormatted = formatCurrency(proforma.total, proforma.currency);
    
    let rawText = config?.whatsappMessageTemplate;
    if (rawText) {
      rawText = rawText
        .replace(/{cliente}/g, clientName)
        .replace(/{asesor}/g, advisorName)
        .replace(/{codigo}/g, proforma.code)
        .replace(/{monto}/g, totalFormatted)
        .replace(/{enlace}/g, publicUrl);
    } else {
      rawText = `Hola ${clientName}, le saluda ${advisorName} de Roble Constructora / Valle Pacora. Le comparto su cotización formal ${proforma.code} por un monto de ${totalFormatted}:\n\nPuede revisarla en línea y descargar el PDF oficial aquí:\n${publicUrl}\n\nQuedo atento a cualquier consulta para coordinar su visita o separación.`;
    }

    const message = encodeURIComponent(rawText);
    
    // Asegurar código de país 51 para evitar número erróneo
    const cleanPhone = getWhatsAppCleanPhone(proforma.client?.phone);
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${message}` 
      : `https://wa.me/?text=${message}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900">
            Compartir Proforma {proforma.code}
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Elige cómo deseas hacer llegar este documento al cliente.
          </p>
        </div>

        <div className="border-t border-slate-100 mb-6"></div>

        {/* Option 1: Enlace directo */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Enlace directo de consulta (solo lectura)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600 flex-1 select-all font-mono outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="bg-[#eef7f2] hover:bg-[#d8eedf] text-[#0e692e] text-xs font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0e692e]" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Option 2: Tarjeta WhatsApp */}
        <div className="border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between mb-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] flex items-center justify-center text-[#059669] shrink-0">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Enviar por WhatsApp
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {proforma.client?.phone ? (
                  <span>Destinatario: <strong className="text-emerald-700 font-mono">{formatPhoneNumber(proforma.client.phone)}</strong></span>
                ) : (
                  'Abre WhatsApp Web con un mensaje personalizado y enlace adjunto.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenWhatsApp}
            className="bg-[#059669] hover:bg-emerald-700 text-white font-medium text-xs px-6 py-2.5 rounded-xl shadow-sm transition-colors shrink-0"
          >
            Abrir
          </button>
        </div>

        {/* Option 3: Descargar PDF Certificado */}
        <div className="border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between mb-8 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Descargar PDF Certificado
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Genera un documento listo para firmar.
              </p>
            </div>
          </div>

          <button
            onClick={() => onDownloadPdf(proforma)}
            className="bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 font-medium text-xs px-6 py-2.5 rounded-xl transition-colors shrink-0"
          >
            Descargar
          </button>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs px-8 py-3 rounded-xl shadow-sm transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
