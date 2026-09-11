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
        status: proforma.status,
        conditions: proforma.conditions,
        items: proforma.items
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

  const getWhatsAppMessage = () => {
    const config = storageService.getConfigSync();
    const clientName = proforma.client?.name?.trim() || 'Estimado(a) cliente';
    const advisorName = proforma.advisorName || config?.advisor?.name || 'Daniel Balarezo';
    const totalAmount = Number(proforma.total) || 60000;
    const totalFormatted = formatCurrency(totalAmount, proforma.currency);
    const conditions = proforma.conditions || {};
    
    // 1. Detección exhaustiva de cultivo: Arándanos vs Palta Hass
    const properties = storageService.getProperties();
    const property = properties.find(p => p.id === proforma.selectedPropertyId) || properties[0];
    
    const isArandano = Boolean(
      (property?.cropType && (property.cropType.toLowerCase().includes('arándano') || property.cropType.toLowerCase().includes('arandano'))) ||
      (property?.category && (property.category.toLowerCase().includes('arándano') || property.category.toLowerCase().includes('arandano'))) ||
      (property?.title && (property.title.toLowerCase().includes('arándano') || property.title.toLowerCase().includes('arandano'))) ||
      (proforma?.selectedPropertyId && proforma.selectedPropertyId.includes('arandano')) ||
      (proforma?.selectedTemplateId && proforma.selectedTemplateId.includes('arandano')) ||
      (proforma?.items && proforma.items.some(it => (it.description || '').toLowerCase().includes('arándano') || (it.description || '').toLowerCase().includes('arandano')))
    );

    // Título garantizado y limpio: SIEMPRE 1,000 m2 (sin caracteres raros)
    const propertyTitle = isArandano
      ? 'Parcela Agrícola - Arándanos (1,000 m2)'
      : 'Parcela Agrícola - Palta Hass (1,000 m2)';

    // 2. Detección exhaustiva de modalidad: Financiado vs Contado
    const paymentType = (conditions.paymentType || proforma.paymentType || '').toLowerCase();
    const paymentMethod = (conditions.paymentMethod || '').toLowerCase();
    const notesText = `${conditions.notes || ''} ${proforma.notes || ''}`.toLowerCase();
    const templateId = (proforma.selectedTemplateId || '').toLowerCase();

    let isFinanced = false;
    if (paymentType === 'financiado' || templateId.includes('financiado')) {
      isFinanced = true;
    } else if (paymentType === 'contado' || templateId.includes('contado')) {
      isFinanced = false;
    } else if (paymentMethod.includes('financ') || notesText.includes('financ') || notesText.includes('cuota') || notesText.includes('saldo:')) {
      isFinanced = true;
    } else if (paymentMethod.includes('contado') || notesText.includes('contado')) {
      isFinanced = false;
    } else if (Number(conditions.months || proforma.months) > 1) {
      isFinanced = true;
    } else {
      // Regla por precio oficial:
      // Palta Hass: 60,000 = financiado, 57,000 = contado
      // Arándanos: 85,000 = financiado, 60,000 = contado
      if (isArandano) {
        isFinanced = totalAmount >= 75000;
      } else {
        isFinanced = totalAmount >= 60000;
      }
    }

    // 3. Extracción de montos financieros
    const defaultInitial = isArandano ? 45000 : 20000;

    let initialNum = conditions.initialPayment !== undefined && conditions.initialPayment !== null
      ? Number(conditions.initialPayment)
      : (proforma.initialPaymentAmount !== undefined && proforma.initialPaymentAmount !== null
          ? Number(proforma.initialPaymentAmount)
          : null);

    let reservationNum = conditions.reservation !== undefined && conditions.reservation !== null
      ? Number(conditions.reservation)
      : (proforma.reservation !== undefined && proforma.reservation !== null
          ? Number(proforma.reservation)
          : 1000);

    let monthsNum = conditions.months !== undefined && conditions.months !== null
      ? Number(conditions.months)
      : (proforma.months !== undefined && proforma.months !== null
          ? Number(proforma.months)
          : 24);

    // Si aún no tenemos inicial, intentar extraer de las notas (ej: "Inicial: S/ 20,000")
    if ((initialNum === null || isNaN(initialNum)) && notesText) {
      const initMatch = notesText.match(/inicial:\s*(?:s\/\.?\s*)?([0-9,.]+)/i);
      if (initMatch) {
        initialNum = parseFloat(initMatch[1].replace(/,/g, ''));
      }
    }
    if (initialNum === null || isNaN(initialNum)) {
      initialNum = defaultInitial;
    }

    // Separación desde notas si no vino en el objeto
    if (isNaN(reservationNum) || reservationNum <= 0) {
      if (notesText) {
        const sepMatch = notesText.match(/separaci[oó]n:\s*(?:s\/\.?\s*)?([0-9,.]+)/i);
        if (sepMatch) {
          reservationNum = parseFloat(sepMatch[1].replace(/,/g, ''));
        }
      }
      if (isNaN(reservationNum) || reservationNum <= 0) {
        reservationNum = 1000;
      }
    }

    const balanceNum = conditions.balance !== undefined && conditions.balance !== null
      ? Number(conditions.balance)
      : Math.max(0, totalAmount - initialNum);

    let quotaNum = conditions.monthlyInstallment !== undefined && conditions.monthlyInstallment !== null
      ? Number(conditions.monthlyInstallment)
      : (proforma.monthlyQuota !== undefined && proforma.monthlyQuota !== null
          ? Number(proforma.monthlyQuota)
          : null);

    if (quotaNum === null || isNaN(quotaNum)) {
      quotaNum = monthsNum > 0 ? balanceNum / monthsNum : 0;
    }

    const initialFormatted = formatCurrency(initialNum, proforma.currency);
    const quotaFormatted = formatCurrency(quotaNum, proforma.currency);

    // 4. Construcción del bloque de financiamiento anterior con viñetas
    let financingLines = '';
    if (isFinanced) {
      financingLines = `- *Cuota Inicial:* ${initialFormatted}\n- *Financiamiento:* ${monthsNum} cuotas de ${quotaFormatted} mensuales (financiamiento directo sin bancos)`;
    } else {
      financingLines = `- *Modalidad:* Pago al Contado`;
    }

    // 5. Construcción garantizada del mensaje anterior
    let rawText = config?.whatsappMessageTemplate;
    
    if (!rawText || rawText.includes('{enlace}') || rawText.includes('Puede revisarla en línea') || rawText.includes('http') || rawText.includes('📄')) {
      return [
        `Hola *${clientName}*, le saluda *${advisorName}* de *Valle Pacora*.`,
        ``,
        `Le comparto los detalles de su cotización formal correspondiente a su consulta:`,
        ``,
        `- *Proforma:* ${proforma.code}`,
        `- *Proyecto:* ${propertyTitle}`,
        `- *Monto Total:* ${totalFormatted}`,
        `${financingLines}`,
        ``,
        `Quedo a su entera disposición para coordinar los siguientes pasos de su separación o resolver cualquier consulta.`,
        ``,
        `Atentamente,`,
        `*${advisorName}*`,
        `_Valle Pacora - Roble Constructora_`
      ].join('\n');
    }

    let processed = rawText.replace(/de \*?Valle Pacora \/ Roble Constructora\*?/gi, 'de *Valle Pacora*');

    if (!processed.includes('{financiamiento}') && !processed.includes('{detalles}') && !processed.includes('{modalidad}')) {
      if (processed.includes('- *Monto Total:* {monto}')) {
        processed = processed.replace('- *Monto Total:* {monto}', `- *Monto Total:* {monto}\n${financingLines}`);
      } else if (processed.includes('{monto}')) {
        processed = processed.replace('{monto}', `{monto}\n${financingLines}`);
      } else {
        processed = `${processed}\n${financingLines}`;
      }
    } else {
      processed = processed
        .replace(/{financiamiento}/g, financingLines)
        .replace(/{detalles}/g, financingLines);
    }

    return processed
      .replace(/{cliente}/g, clientName)
      .replace(/{asesor}/g, advisorName)
      .replace(/{codigo}/g, proforma.code)
      .replace(/{propiedad}/g, propertyTitle)
      .replace(/{monto}/g, totalFormatted)
      .replace(/{inicial}/g, initialFormatted)
      .replace(/{meses}/g, String(monthsNum))
      .replace(/{cuota}/g, quotaFormatted);
  };

  const handleOpenWhatsApp = () => {
    const rawText = getWhatsAppMessage();
    const message = encodeURIComponent(rawText);
    const cleanPhone = getWhatsAppCleanPhone(proforma.client?.phone);
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${message}` 
      : `https://wa.me/?text=${message}`;

    window.open(waUrl, '_blank');
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
                    'Abre WhatsApp con el mensaje formal estructurado.'
                  )}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                  <span>💬 Abre directo el chat con la cotización detallada</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="bg-[#059669] hover:bg-emerald-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors shrink-0"
            >
              Abrir
            </button>
          </div>
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
