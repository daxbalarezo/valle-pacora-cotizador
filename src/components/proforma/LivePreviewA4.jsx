import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { COMPANY_INFO } from '../../services/storageService';
import { Layers, FileText, ShieldCheck, MapPin, Building2 } from 'lucide-react';
import { MEMBRETE_OFICIAL_BG } from '../../assets/membreteBase64';
import { getPaltaProjection, getArandanoProjection } from '../../utils/profitabilityCalc';

export default function LivePreviewA4({ proforma, property }) {
  const [activePreviewPage, setActivePreviewPage] = useState(1);
  const containerRef = React.useRef(null);
  const [scale, setScale] = useState(1);

  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const newScale = Math.min(1, Math.max(0.4, (width - 16) / 595));
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const clientName = proforma.client?.name || 'Nombre del Cliente';
  const clientDoc = proforma.client?.docNumber 
    ? `${proforma.client.docType || 'DNI'}: ${proforma.client.docNumber}` 
    : 'DNI: -';
  const clientEmail = proforma.client?.email || '';
  const clientPhone = proforma.client?.phone || '';

  const advisorName = proforma.advisorName || 'Daniel Balarezo';
  const advisorRole = proforma.advisorRole || 'Asesor Comercial Especializado';
  const advisorPhone = proforma.advisorPhone || '+51 987 654 321';
  const validDays = proforma.client?.validDays || `${proforma.conditions?.validDays || 7} días calendarios`;
  
  const displayDate = proforma.formattedDate || formatDate(proforma.createdAt) || '04 Sep 2026';
  const code = proforma.code || '#COT-1001';
  const hasFloorPlan = proforma.includeFloorPlan !== false;

  // Variables de Financiamiento y Matemática de Cuotas
  const totalAmount = Number(proforma.total) || 60000;
  const conditions = proforma.conditions || {};
  const paymentType = conditions.paymentType || 'financiado';
  const defaultInitial = totalAmount >= 80000 ? 45000 : 20000;
  const initialPayment = conditions.initialPayment !== undefined ? Number(conditions.initialPayment) : defaultInitial;
  const reservation = conditions.reservation !== undefined ? Number(conditions.reservation) : 1000;
  const months = conditions.months !== undefined ? Number(conditions.months) : 24;
  const hasHarvestBonus = conditions.hasHarvestBonus || false;
  const balance = Math.max(0, totalAmount - initialPayment - (hasHarvestBonus ? 10000 : 0));
  const monthlyInstallment = months > 0 ? balance / months : 0;

  const isArandano = Boolean(
    (property?.cropType && (property.cropType.toLowerCase().includes('arándano') || property.cropType.toLowerCase().includes('arandano'))) ||
    (property?.category && (property.category.toLowerCase().includes('arándano') || property.category.toLowerCase().includes('arandano'))) ||
    (property?.title && (property.title.toLowerCase().includes('arándano') || property.title.toLowerCase().includes('arandano'))) ||
    (proforma?.selectedPropertyId && proforma.selectedPropertyId.includes('arandano')) ||
    (proforma?.items && proforma.items.some(it => (it.description || '').toLowerCase().includes('arándano') || (it.description || '').toLowerCase().includes('arandano')))
  );

  const cropImageUrl = isArandano ? "/arandano_field.jpg" : (property?.planImageUrl || "/palta_hass_field.jpg");
  const cropName = isArandano ? "Arándanos" : "Palta Hass";
  const cropTitle = isArandano ? "Parcela Agrícola - Arándanos (1,000 m²)" : "Parcela Agrícola - Palta Hass (1,000 m²)";

  const quantity = proforma.items?.[0]?.quantity || 1;
  const profData = isArandano ? getArandanoProjection(quantity) : getPaltaProjection(quantity);

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      {/* Page switcher if 2 pages are enabled */}
      {hasFloorPlan && (
        <div className="flex items-center justify-between w-full max-w-[595px] mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hojas A4:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setActivePreviewPage(1)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activePreviewPage === 1 
                    ? 'bg-white text-[#0e692e] shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pág. 1: Propuesta Económica
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewPage(2)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activePreviewPage === 2 
                    ? 'bg-white text-[#0e692e] shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pág. 2: Anexo Técnico y Plano
              </button>
            </div>
          </div>
          <span className="text-[11px] text-[#0e692e] bg-[#eef7f2] border border-[#0e692e]/20 px-2.5 py-0.5 rounded-full font-semibold">
            2 Páginas (A4 Estándar)
          </span>
        </div>
      )}

      {/* Wrapper proporcional que escala en móviles sin distorsionar el documento */}
      <div 
        className="w-full flex justify-center overflow-visible transition-all"
        style={{ height: `${842 * scale}px` }}
      >
        {/* Main A4 Document Sheet con Membrete Oficial Valle Pacora (Proporción exacta A4: 595 x 842 pt) */}
        <div 
          className="w-[595px] h-[842px] bg-white border border-slate-200 shadow-xl rounded-xl pt-[84px] pb-[88px] px-7 sm:px-8 flex flex-col justify-between text-slate-800 transition-all font-sans select-none overflow-hidden bg-no-repeat bg-cover bg-center shrink-0 origin-top"
          style={{ 
            backgroundImage: `url(${MEMBRETE_OFICIAL_BG})`, 
            backgroundSize: '100% 100%',
            transform: `scale(${scale})`
          }}
        >
        {activePreviewPage === 1 ? (
          /* PAGE 1: PROPUESTA ECONÓMICA Y COMERCIAL */
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0e692e]">
                <div className="flex items-center gap-3">
                  <img 
                    src="/logo_valle_pacora.png" 
                    alt="Valle Pacora" 
                    className="h-8 w-auto object-contain shrink-0" 
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                      {COMPANY_INFO.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      RUC: {COMPANY_INFO.ruc}
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end justify-center">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-slate-900 text-xs tracking-wider uppercase">
                      COTIZACIÓN
                    </span>
                    <span className="font-display font-bold text-[#0e692e] bg-[#eef7f2] border border-[#0e692e]/20 text-[11px] px-2 py-0.5 rounded-full font-mono">
                      {code}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Fecha de emisión: {displayDate}
                  </p>
                </div>
              </div>

              {/* 2 Columns: Client vs Advisor */}
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5">
                <div>
                  <p className="text-[9px] font-bold text-[#0e692e] uppercase tracking-wider mb-0.5">
                    Preparado Para:
                  </p>
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                    {clientName}
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {clientDoc}
                  </p>
                  {clientEmail && (
                    <p className="text-[9px] text-slate-500 truncate">
                      Email: {clientEmail}
                    </p>
                  )}
                  {clientPhone && (
                    <p className="text-[9px] text-slate-500">
                      Tel: {clientPhone}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[9px] font-bold text-[#0e692e] uppercase tracking-wider mb-0.5">
                    Asesor Comercial Responsable:
                  </p>
                  <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                    {advisorName}
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {advisorRole}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Tel: {advisorPhone}
                  </p>
                </div>
              </div>

              {/* Concepts Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[9px]">
                      <th className="py-2 px-3">CONCEPTO / PARCELA AGRÍCOLA</th>
                      <th className="py-2 px-2 text-center w-12">CANT.</th>
                      <th className="py-2 px-3 text-right w-24">PRECIO UNIT.</th>
                      <th className="py-2 px-3 text-right w-24">IMPORTE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(proforma.items && proforma.items.length > 0) ? (
                      proforma.items.map((item, idx) => (
                        <tr key={item.id || idx} className="bg-white">
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {item.description || 'Parcela Agrícola Valle Pacora'}
                          </td>
                          <td className="py-2 px-2 text-slate-600 text-center tabular-nums">
                            {item.quantity || 1}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-right tabular-nums">
                            {formatCurrency(item.unitPrice, proforma.currency)}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 text-right tabular-nums">
                            {formatCurrency(item.total, proforma.currency)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-3 text-center text-slate-400">
                          Sin conceptos asignados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Summary & Conditions */}
              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-7 bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5">
                  <p className="text-[9px] font-bold text-[#0e692e] uppercase tracking-wider mb-0.5">
                    Modalidad de Pago:
                  </p>
                  <h4 className="text-[10px] font-bold text-slate-900 leading-tight">
                    {paymentType === 'contado' 
                      ? 'Pago al Contado con Descuento Inmediato' 
                      : `Financiamiento Directo (${months} Cuotas)`}
                  </h4>
                  <p className="text-[9.5px] text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                    {paymentType === 'contado'
                      ? `Separación: ${formatCurrency(reservation, proforma.currency)}\nSaldo restante se completara en 7 dias calendario.`
                      : `Pago Inicial: ${formatCurrency(initialPayment, proforma.currency)} (financiamiento directo sin bancos).\n${proforma.conditions?.hasHarvestBonus ? `Pago en Cosecha: S/ 10,000 en 3er año.` : ''}`}
                  </p>
                </div>

                <div className="col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Precio Total:</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {formatCurrency(proforma.total, proforma.currency)}
                    </span>
                  </div>

                  {proforma.totalDiscount > 0 && (
                    <div className="flex justify-between text-[10px] text-emerald-700 font-semibold">
                      <span>Descuento:</span>
                      <span className="tabular-nums">-{formatCurrency(proforma.totalDiscount, proforma.currency)}</span>
                    </div>
                  )}

                  {paymentType === 'financiado' && (
                    <>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>Pago Inicial:</span>
                        <span className="text-slate-800 tabular-nums">
                          -{formatCurrency(initialPayment, proforma.currency)}
                        </span>
                      </div>
                      
                      {proforma.conditions?.hasHarvestBonus && (
                        <div className="flex justify-between text-[10px] text-slate-600">
                          <span>Pago en Cosecha:</span>
                          <span className="text-slate-800 tabular-nums">
                            -{formatCurrency(10000, proforma.currency)}
                          </span>
                        </div>
                      )}

                      <div className="border-t-2 border-[#0e692e] pt-2 mt-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] font-bold text-slate-600 uppercase">Saldo a Financiar:</span>
                          <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                            {formatCurrency(balance, proforma.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline bg-[#eef7f2] px-1.5 py-1 rounded">
                          <span className="text-[10px] font-extrabold text-[#0e692e] uppercase">{months} CUOTAS DE:</span>
                          <span className="text-sm font-display font-extrabold text-[#0e692e] tabular-nums">
                            {formatCurrency(monthlyInstallment, proforma.currency)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {paymentType === 'contado' && (
                    <div className="border-t-2 border-[#0e692e] pt-1.5 flex justify-between items-baseline">
                      <span className="text-[10px] font-extrabold text-slate-900">INVERSIÓN TOTAL:</span>
                      <span className="text-sm font-display font-extrabold text-[#0e692e] tabular-nums">
                        {formatCurrency(Math.max(0, proforma.total - proforma.totalDiscount), proforma.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Official Bank Accounts */}
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Cuentas Corrientes Oficiales Recaudadoras ({COMPANY_INFO.name}):
                </p>
                <div className="grid grid-cols-3 gap-3 text-slate-700">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-[10.5px] block leading-tight">BCP (Soles):</span>
                    <span className="font-mono text-[9.5px] font-medium text-slate-800 block">Cta: 3057063526053</span>
                    <span className="font-mono text-[9px] text-slate-600 block">CCI: 00230500706352605315</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-[10.5px] block leading-tight">BBVA (Soles):</span>
                    <span className="font-mono text-[9.5px] font-medium text-slate-800 block">Cta: 001103480200403552</span>
                    <span className="font-mono text-[9px] text-slate-600 block">CCI: 01134800020040355209</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-[10.5px] block leading-tight">BBVA (Dólares):</span>
                    <span className="font-mono text-[9.5px] font-medium text-slate-800 block">Cta: 001103480200438836</span>
                    <span className="font-mono text-[9px] text-slate-600 block">CCI: 01134800020043883605</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Firma Única Oficial: Gerente General */}
            <div className="flex flex-col items-center justify-center pt-2 pb-0.5">
              <div className="w-64 border-t border-slate-600 text-center pt-1.5">
                <p className="text-[9.5px] font-bold text-slate-900 tracking-wider uppercase leading-tight">
                  ELMER DIONI GARCIA FERNANDEZ
                </p>
                <p className="text-[8px] font-bold text-[#0e692e] uppercase tracking-wider mt-0.5">
                  GERENTE GENERAL
                </p>
                <p className="text-[7.5px] text-slate-500 font-medium">
                  {COMPANY_INFO.name}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* PAGE 2: ANEXO TÉCNICO Y PLANO CATASTRAL */
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-3.5">
              {/* Header Ficha Técnica */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0e692e]">
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/logo_valle_pacora.png" 
                    alt="Valle Pacora" 
                    className="h-7 w-auto object-contain shrink-0" 
                  />
                  <div>
                    <span className="text-[9px] font-bold text-[#0e692e] uppercase tracking-wider block">
                      ANEXO TÉCNICO Y FICHA AGRÍCOLA
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-0.5">
                      {property?.title || cropTitle}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#0e692e]">{code}</span>
                  <span className="text-[9px] text-slate-400 block">Anexo Técnico</span>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#F8FAFC] border border-slate-200 p-2 rounded-lg">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Área Total</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {property?.area ? `${property.area} m²` : '1,000 m²'}
                  </p>
                </div>
                <div className="bg-[#F8FAFC] border border-slate-200 p-2 rounded-lg">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Cultivo Apto</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {property?.cropType || property?.category || cropName}
                  </p>
                </div>
                <div className="bg-[#F8FAFC] border border-slate-200 p-2 rounded-lg">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Sistema de Riego</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {property?.waterAccess ? 'Punto Presurizado' : 'Riego por Goteo'}
                  </p>
                </div>
              </div>

              {/* Tabla de Rentabilidad Proyectada */}
              <div className="border border-[#166534] rounded-lg overflow-hidden mt-1">
                <table className="w-full text-left text-[9px]">
                  <thead className="bg-[#166534] text-white font-bold">
                    <tr>
                      <th className="py-1.5 px-2.5 w-[15%]">Año</th>
                      <th className="py-1.5 px-2 w-[37%]">Cosecha (kg)</th>
                      <th className="py-1.5 px-2 w-[16%] text-right">Ingreso Bruto</th>
                      <th className="py-1.5 px-2 w-[16%] text-right">Costos</th>
                      <th className="py-1.5 px-2.5 w-[16%] text-right">Utilidad Neta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {profData.rows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 !== 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-1.5 px-2.5 text-slate-900 font-bold leading-tight">
                          {row.period}
                          {row.badge && <span className="block text-[7.5px] text-[#166534] mt-0.5">{row.badge}</span>}
                        </td>
                        
                        {row.isInvestment ? (
                          <td colSpan="4" className="py-1.5 px-2 text-slate-500 italic text-[8.5px]">
                            {row.label}
                          </td>
                        ) : (
                          <>
                            <td className="py-1.5 px-2 text-slate-600 font-medium">{row.production}</td>
                            <td className="py-1.5 px-2 text-slate-600 text-right tabular-nums">{formatCurrency(row.revenue, proforma.currency)}</td>
                            <td className="py-1.5 px-2 text-slate-600 text-right tabular-nums">{formatCurrency(row.costs, proforma.currency)}</td>
                            <td className="py-1.5 px-2.5 text-[#166534] font-bold text-right tabular-nums">{formatCurrency(row.profit, proforma.currency)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#f0fdf4] border-t-2 border-[#166534]">
                    <tr>
                      <td className="py-2 px-2.5 text-[#166534] font-bold">TOTAL ({profData.totalYears} años)</td>
                      <td className="py-2 px-2 text-slate-400">--</td>
                      <td className="py-2 px-2 text-[#166534] font-bold text-right tabular-nums">{formatCurrency(profData.totalRevenue, proforma.currency)}</td>
                      <td className="py-2 px-2 text-slate-400 text-right">--</td>
                      <td className="py-2 px-2.5 text-[#166534] font-bold text-right tabular-nums text-[10px]">{formatCurrency(profData.totalProfit, proforma.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Amenities List */}
              <div className="mt-3">
                <h4 className="text-[8.5px] font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Especificaciones Agronómicas y Garantías Legales:
                </h4>
                <div className="grid grid-cols-2 gap-1">
                  {(property?.amenities || [
                    "Acceso carrozable directo e independiente",
                    "Puntos de riego tecnificado por goteo a pie de lote",
                    "Título de propiedad independizado en SUNARP",
                    "Factibilidad de energía eléctrica y servicios",
                    "Alta plusvalía garantizada por corredor agroindustrial",
                    "Suelo agrícola de primera calidad y clima óptimo"
                  ])
                  .filter(amenity => !amenity.toLowerCase().includes('financiado') && !amenity.toLowerCase().includes('contado'))
                  .map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[8.5px] text-slate-700 bg-[#F8FAFC] border border-slate-200 px-2 py-0.5 rounded">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#059669] shrink-0"></div>
                      <span className="truncate">{amenity.replace(/Palta Hass/gi, cropName)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
