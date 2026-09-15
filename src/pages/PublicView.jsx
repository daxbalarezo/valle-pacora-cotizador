import React, { useState, useEffect } from 'react';
import { storageService, COMPANY_INFO } from '../services/storageService';
import { formatCurrency, formatDate, getWhatsAppCleanPhone } from '../utils/formatters';
import { Download, MessageCircle, CheckCircle, Clock, ShieldCheck, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useParams } from 'react-router-dom';
import { downloadProformaPdf } from '../utils/pdfGenerator';

export default function PublicView() {
  const { token: routeToken } = useParams();
  const token = routeToken || 'cot-1044-janet';

  const [proforma, setProforma] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await storageService.getProformaByToken(token);
      if (data) {
        setProforma(data);
        const props = storageService.getProperties();
        const prop = props.find(p => p.id === data.selectedPropertyId) || props[0];
        setProperty(prop);
        if (data.status === 'aprobada') {
          setApproved(true);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [token]);

  const handleApprove = async () => {
    if (!proforma) return;
    await storageService.updateStatus(proforma.id, 'aprobada');
    setApproved(true);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleContactWhatsApp = () => {
    if (!proforma) return;
    const advisorPhone = getWhatsAppCleanPhone(proforma.advisorPhone || COMPANY_INFO.phone);
    const message = encodeURIComponent(
      `Hola ${proforma.advisorName || 'Daniel Balarezo'}, revisé la cotización ${proforma.code} de Valle Pacora por un total de ${formatCurrency(proforma.total, proforma.currency)}. Deseo coordinar los siguientes pasos para la separación.`
    );
    window.open(`https://wa.me/${advisorPhone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-600">Cargando cotización oficial...</p>
        </div>
      </div>
    );
  }

  if (!proforma) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Proforma no encontrada</h2>
          <p className="text-xs text-slate-500 mb-6">
            El enlace de la cotización es inválido o ha expirado. Por favor, comunícate con tu asesor comercial.
          </p>
          <a
            href="/"
            className="inline-block bg-[#0e692e] text-white text-xs font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0a5224] transition-colors"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  const clientName = proforma.client?.name || 'Cliente';
  const displayDate = proforma.formattedDate || formatDate(proforma.createdAt) || '04 Sep 2026';

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner Superior de Estado */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo_valle_pacora.png" 
              alt="Valle Pacora" 
              className="h-10 w-auto object-contain shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  {COMPANY_INFO.name}
                </h1>
                <span className="bg-[#eef7f2] text-[#0e692e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Valle Pacora
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Documento de Cotización Oficial {proforma.code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onDownloadPdf(proforma)}
              className="flex-1 sm:flex-none border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={handleContactWhatsApp}
              className="flex-1 sm:flex-none bg-[#059669] hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Hablar con Asesor</span>
            </button>
          </div>
        </div>

        {/* Hoja de la Proforma A4 */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          {/* Header de la Cotización */}
          <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#0e692e] uppercase tracking-wider">
                Emisor Autorizado
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {COMPANY_INFO.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                RUC: {COMPANY_INFO.ruc}
              </p>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-wider uppercase">
                  COTIZACIÓN
                </span>
                <span className="text-xs font-bold text-[#0e692e] bg-[#eef7f2] border border-[#0e692e]/20 px-2.5 py-0.5 rounded-full font-mono">
                  {proforma.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Fecha de emisión: {displayDate}
              </p>
            </div>
          </div>

          {/* Bloque Destinatario y Asesor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl p-5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                PREPARADO PARA:
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {clientName}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {proforma.client?.docType || 'RUC/DNI'}: {proforma.client?.docNumber || '-'}
              </p>
              {proforma.client?.email && (
                <p className="text-xs text-slate-500 mt-0.5">{proforma.client.email}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ASESOR ASIGNADO:
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {proforma.advisorName || 'Daniel Balarezo'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {proforma.advisorRole || 'Asesor Comercial'}
              </p>
              <p className="text-xs text-[#0e692e] mt-0.5 font-medium flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {proforma.advisorPhone || '+51 987 654 321'}
              </p>
            </div>
          </div>

          {/* Tabla de Conceptos */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Detalle de la Propuesta Económica
            </h4>
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                      CONCEPTO
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center w-20">
                      CANT.
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-right w-36">
                      IMPORTE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proforma.items?.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 text-center">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-slate-900 text-right">
                        {formatCurrency(item.total, proforma.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales y Condiciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Condiciones Comerciales
              </h4>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {proforma.conditions?.notes ||
                  'Forma de pago: S/ 1,000 de separacion y 60% de inicial maximo en 15 dias.\nTiempo de validez de la proforma 7 dias calendarios.'}
              </p>
            </div>

            <div className="flex flex-col justify-end space-y-2.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(proforma.subtotal, proforma.currency)}
                </span>
              </div>

              {proforma.totalDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                  <span>Bono Habitacional / Descuento:</span>
                  <span>-{formatCurrency(proforma.totalDiscount, proforma.currency)}</span>
                </div>
              )}

              {proforma.tax > 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>IGV (18%):</span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(proforma.tax, proforma.currency)}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Inversión Final:</span>
                <span className="text-2xl font-black text-[#0e692e] tracking-tight">
                  {formatCurrency(proforma.total, proforma.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Ficha Técnica y Plano (Si includeFloorPlan está activo) */}
          {proforma.includeFloorPlan && property && (
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0e692e] uppercase tracking-wider">
                  Anexo Técnico Agrícola
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Ficha Técnica de la Parcela Agrícola
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F8FAFC] border border-slate-100 p-3.5 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Área Total</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{property.area} m²</p>
                </div>
                <div className="bg-[#F8FAFC] border border-slate-100 p-3.5 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Cultivo Apto</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{property.cropType || 'Palta Hass / Arándano'}</p>
                </div>
                <div className="bg-[#F8FAFC] border border-slate-100 p-3.5 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Sistema de Riego</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{property.waterAccess || 'Punto Presurizado'}</p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200">
                {(() => {
                  const isArandano = Boolean(
                    (property?.cropType && (property.cropType.toLowerCase().includes('arándano') || property.cropType.toLowerCase().includes('arandano'))) ||
                    (property?.category && (property.category.toLowerCase().includes('arándano') || property.category.toLowerCase().includes('arandano'))) ||
                    (property?.title && (property.title.toLowerCase().includes('arándano') || property.title.toLowerCase().includes('arandano'))) ||
                    (proforma?.selectedPropertyId && proforma.selectedPropertyId.includes('arandano')) ||
                    (proforma?.items && proforma.items.some(it => (it.description || '').toLowerCase().includes('arándano') || (it.description || '').toLowerCase().includes('arandano')))
                  );
                  const cropImageUrl = isArandano ? "/arandano_field.jpg" : (property?.planImageUrl || "/palta_hass_field.jpg");
                  const cropName = isArandano ? "Cultivo de Arándanos" : "Cultivo de Palta Hass";
                  return (
                    <img
                      src={cropImageUrl}
                      alt={cropName}
                      className="w-full h-64 object-cover"
                    />
                  );
                })()}
              </div>
            </div>
          )}

          {/* Botón de Aceptación del Cliente */}
          <div className="pt-8 border-t border-slate-100 text-center">
            {approved ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-800 inline-flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <div className="text-left">
                  <h4 className="font-bold text-sm">¡Cotización Aprobada con Éxito!</h4>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Tu asesor comercial se pondrá en contacto para coordinar la separación de tu parcela agrícola.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="w-full bg-[#0e692e] hover:bg-[#0a5224] text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-sm transition-all"
                >
                  Aceptar y Confirmar Cotización
                </button>
                <p className="text-[11px] text-slate-400">
                  Al aceptar, se notificará inmediatamente a {proforma.advisorName || 'Daniel Balarezo'} para coordinar la separación de tu parcela agrícola con S/ 1,000.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
