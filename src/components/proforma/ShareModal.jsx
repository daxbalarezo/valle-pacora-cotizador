import React, { useState } from 'react';
import { MessageSquare, FileText, Check, Copy, Loader2 } from 'lucide-react';
import { formatCurrency, formatPhoneNumber, getWhatsAppCleanPhone } from '../../utils/formatters';
import { storageService } from '../../services/storageService';
import { generateProformaPdfBlob } from '../../utils/pdfGenerator';

export default function ShareModal({ 
  isOpen, 
  onClose, 
  proforma, 
  onDownloadPdf 
}) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [desktopHint, setDesktopHint] = useState(false);

  if (!isOpen || !proforma) return null;

  const buildShareUrl = () => {
    const token = proforma.publicToken || proforma.code.replace('#', '').toLowerCase();
    const base = `${window.location.origin}/p/${token}`;
    try {
      const compactData = {
        id: proforma.id,
        code: proforma.code,
        publicToken: proforma.publicToken || token,
        createdAt: proforma.createdAt,
        advisorName: proforma.advisorName,
        advisorPhone: proforma.advisorPhone,
        client: proforma.client,
        selectedPropertyId: proforma.selectedPropertyId,
        currency: proforma.currency,
        customPrice: proforma.customPrice,
        initialPaymentPct: proforma.initialPaymentPct,
        initialPaymentAmount: proforma.initialPaymentAmount,
        months: proforma.months,
        monthlyQuota: proforma.monthlyQuota,
        total: proforma.total,
        discount: proforma.discount,
        paymentSchedule: proforma.paymentSchedule,
        notes: proforma.notes,
        status: proforma.status
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(compactData))));
      return `${base}?d=${encoded}`;
    } catch {
      return base;
    }
  };

  const publicUrl = buildShareUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = async () => {
    setIsSharing(true);
    setDesktopHint(false);

    try {
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

      // 1. Generar el Blob del PDF
      const blob = await generateProformaPdfBlob(proforma);
      const cleanCode = (proforma.code || 'VallePacora').replace('#', '');
      const fileName = `Proforma-${cleanCode}.pdf`;
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // 2. Comprobar si el navegador soporta compartir archivos nativos (móviles iOS / Android)
      const canShareFile = typeof navigator !== 'undefined' && 
                           navigator.canShare && 
                           navigator.canShare({ files: [file] });

      if (canShareFile) {
        try {
          await navigator.share({
            title: `Proforma ${proforma.code} - Valle Pacora`,
            text: rawText,
            files: [file],
          });
          setIsSharing(false);
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') {
            // El usuario cerró la ventana de compartir nativa
            setIsSharing(false);
            return;
          }
          console.warn('[ShareModal] navigator.share falló, ejecutando fallback:', shareErr);
        }
      }

      // 3. Fallback inteligente para Desktop (WhatsApp Web no permite inyección de archivos por enlace):
      // Descargar el PDF directamente para que el usuario no tenga que hacer nada más que arrastrarlo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Abrir WhatsApp Web con el mensaje prellenado
      const message = encodeURIComponent(rawText);
      const cleanPhone = getWhatsAppCleanPhone(proforma.client?.phone);
      const waUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${message}` 
        : `https://wa.me/?text=${message}`;

      window.open(waUrl, '_blank');
      setDesktopHint(true);
    } catch (error) {
      console.error('[ShareModal] Error al procesar WhatsApp:', error);
      alert('Hubo un inconveniente al generar el PDF: ' + error.message);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
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
        <div className="border border-slate-200/80 rounded-2xl p-4 mb-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between gap-3">
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
                    'Adjunta el PDF automáticamente y abre WhatsApp.'
                  )}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                  <span>📎 Adjunta el PDF oficial en el mensaje</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              disabled={isSharing}
              className="bg-[#059669] hover:bg-emerald-700 disabled:opacity-75 disabled:cursor-wait text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors shrink-0 flex items-center gap-2"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparando...</span>
                </>
              ) : (
                'Enviar'
              )}
            </button>
          </div>

          {/* Aviso contextual cuando se usa en Desktop */}
          {desktopHint && (
            <div className="mt-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">¡PDF descargado y WhatsApp abierto!</span>
                <p className="text-emerald-700 text-[11px] mt-0.5 leading-relaxed">
                  El archivo PDF ya se descargó en tu computadora. Solo arrástralo a la conversación de WhatsApp Web que se acaba de abrir.
                </p>
              </div>
            </div>
          )}
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
