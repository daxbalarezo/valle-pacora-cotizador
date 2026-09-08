import React, { useState, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Share2, 
  Edit3, 
  Copy, 
  CheckCircle2, 
  Download, 
  Trash2, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';
import { formatCurrency, getInitials } from '../../utils/formatters';

export default function ProformaTable({ 
  proformas = [], 
  onShare, 
  onEdit, 
  onDuplicate, 
  onChangeStatus, 
  onDownloadPdf, 
  onDelete 
}) {
  // Estado para el menú flotante con coordenadas fijas (desvinculado del overflow de la tabla)
  const [activeMenu, setActiveMenu] = useState(null);

  // Cerrar el menú si el usuario hace scroll o cambia el tamaño de la ventana
  useEffect(() => {
    if (!activeMenu) return;
    const handleScrollOrResize = () => setActiveMenu(null);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [activeMenu]);

  const handleOpenMenu = (e, p) => {
    e.stopPropagation();
    if (activeMenu?.id === p.id) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 310;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

    setActiveMenu({
      id: p.id,
      proforma: p,
      top: openUpward ? Math.max(10, rect.top - menuHeight) : rect.bottom + 6,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'aprobada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Aprobada
          </span>
        );
      case 'enviada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef7f2] text-[#0e692e] border border-[#0e692e]/20">
            <Send className="w-3 h-3" />
            Enviada
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#EF4444] border border-red-200">
            <XCircle className="w-3 h-3" />
            Rechazada
          </span>
        );
      case 'borrador':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-slate-600 border border-slate-200">
            <Clock className="w-3 h-3" />
            Borrador
          </span>
        );
    }
  };

  const statusOptions = [
    { id: 'enviada', label: 'Enviada', dotColor: 'bg-[#0e692e]' },
    { id: 'aprobada', label: 'Aprobada', dotColor: 'bg-emerald-500' },
    { id: 'borrador', label: 'Borrador', dotColor: 'bg-slate-400' },
    { id: 'rechazada', label: 'Rechazada', dotColor: 'bg-rose-500' },
  ];

  if (proformas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm min-h-[360px] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0e692e]/10 text-[#0e692e] flex items-center justify-center mx-auto mb-3.5">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-display font-bold text-slate-900 mb-1">
          No hay proformas registradas
        </h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
          Comienza creando la primera proforma formal para una Parcela Agrícola de Palta Hass o Arándanos en Valle Pacora.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm relative min-h-[380px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">CÓDIGO</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">CLIENTE</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">FECHA</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">TOTAL</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">ESTADO</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proformas.map((p) => {
                const clientName = p.client?.name?.trim() || 'Cliente Particular';
                const isCurrentMenuOpen = activeMenu?.id === p.id;

                return (
                  <tr 
                    key={p.id} 
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onEdit(p)}
                  >
                    {/* Código */}
                    <td className="py-4 px-6">
                      <span className="text-sm font-display font-bold text-[#0e692e] tracking-tight hover:underline tabular-nums">
                        {p.code}
                      </span>
                    </td>

                    {/* Cliente */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#eef7f2] border border-[#0e692e]/20 text-[#0e692e] flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(clientName)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-900 truncate max-w-[220px] block">
                            {clientName}
                          </span>
                          {p.client?.docNumber && (
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {p.client?.docType || 'DNI'}: {p.client.docNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-6">
                      <span className="text-xs text-slate-600 font-medium">
                        {p.formattedDate || '04 Sep 2026'}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-4 px-6">
                      <span className="text-sm font-display font-bold text-slate-900 tabular-nums">
                        {formatCurrency(p.total, p.currency)}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6">
                      {getStatusBadge(p.status)}
                    </td>

                    {/* Acciones */}
                    <td 
                      className="py-4 px-6 text-right" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleOpenMenu(e, p)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isCurrentMenuOpen 
                            ? 'bg-[#eef7f2] text-[#0e692e] shadow-sm ring-2 ring-[#0e692e]/20' 
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Opciones de proforma"
                      >
                        <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MENÚ FLOTANTE FIJO (POSITION FIXED): TOTALMENTE LIBRE DE RECORTES DE OVERFLOW */}
      {activeMenu && (
        <>
          {/* Backdrop invisible para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-40 cursor-default bg-black/5 backdrop-blur-[0.5px] transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(null);
            }}
          />

          {/* Tarjeta flotante del menú anclada a coordenadas de la pantalla */}
          <div
            style={{
              position: 'fixed',
              top: `${activeMenu.top}px`,
              right: `${activeMenu.right}px`,
            }}
            className="w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 text-left animate-in fade-in zoom-in-95 duration-100 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3.5 py-1.5 mb-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Opciones: {activeMenu.proforma.code}
              </span>
              <span className="text-[10px] font-semibold text-[#0e692e] capitalize bg-[#eef7f2] px-2 py-0.5 rounded">
                {activeMenu.proforma.status || 'Borrador'}
              </span>
            </div>

            {/* 1. Compartir Proforma */}
            <button
              type="button"
              onClick={() => {
                const p = activeMenu.proforma;
                setActiveMenu(null);
                onShare(p);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-[#eef7f2] hover:text-[#0e692e] flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#0e692e]" />
              <span>Compartir Proforma</span>
            </button>

            {/* 2. Editar / Abrir */}
            <button
              type="button"
              onClick={() => {
                const p = activeMenu.proforma;
                setActiveMenu(null);
                onEdit(p);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Editar / Abrir</span>
            </button>

            {/* 3. Descargar PDF */}
            <button
              type="button"
              onClick={() => {
                const p = activeMenu.proforma;
                setActiveMenu(null);
                onDownloadPdf(p);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Descargar PDF A4</span>
            </button>

            {/* 4. Duplicar Proforma */}
            <button
              type="button"
              onClick={() => {
                const id = activeMenu.proforma.id;
                setActiveMenu(null);
                onDuplicate(id);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Duplicar Proforma</span>
            </button>

            <div className="border-t border-slate-100 my-1.5"></div>

            {/* 5. Cambiar Estado */}
            <div className="px-3.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Cambiar Estado:
            </div>
            {statusOptions.map((st) => {
              const isCurrentStatus = activeMenu.proforma.status === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    const id = activeMenu.proforma.id;
                    setActiveMenu(null);
                    onChangeStatus(id, st.id);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isCurrentStatus 
                      ? 'bg-[#F8FAFC] text-[#0e692e] font-bold' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${st.dotColor}`}></span>
                    <span>{st.label}</span>
                  </div>
                  {isCurrentStatus && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0e692e]" />
                  )}
                </button>
              );
            })}

            <div className="border-t border-slate-100 my-1.5"></div>

            {/* 6. Eliminar Proforma */}
            <button
              type="button"
              onClick={() => {
                const id = activeMenu.proforma.id;
                setActiveMenu(null);
                onDelete(id);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Eliminar Proforma</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
