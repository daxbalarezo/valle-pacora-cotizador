import React, { useState, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ProformaTable from '../components/proforma/ProformaTable';
import ShareModal from '../components/proforma/ShareModal';
import { Bell, Search } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard({ 
  proformas = [], 
  advisors = [],
  onNewProforma, 
  onEditProforma, 
  onDuplicateProforma,
  onChangeStatus,
  onDownloadPdf,
  onDeleteProforma,
  onNavigateTab
}) {
  const [currentTab, setCurrentTab] = useState('proformas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProformaForShare, setSelectedProformaForShare] = useState(null);

  // Filtrado de proformas por búsqueda (código, cliente, DNI o asesor)
  const filteredProformas = useMemo(() => {
    if (!searchQuery.trim()) return proformas;
    const q = searchQuery.toLowerCase();
    return proformas.filter(p => 
      p.code?.toLowerCase().includes(q) ||
      p.client?.name?.toLowerCase().includes(q) ||
      p.client?.docNumber?.includes(q) ||
      p.advisorName?.toLowerCase().includes(q)
    );
  }, [proformas, searchQuery]);

  // Métricas dinámicas calculadas
  const metrics = useMemo(() => {
    const totalMonth = proformas.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
    const activeCount = proformas.filter(p => p.status !== 'rechazada').length;
    
    // Opción 4: Contar clientes únicos cotizados en el mes
    const uniqueClients = new Set(
      proformas
        .map(p => p.client?.docNumber?.trim() || p.client?.name?.trim())
        .filter(Boolean)
    );
    const clientsCount = uniqueClients.size;

    return {
      totalMonth: totalMonth,
      activeCount: activeCount,
      clientsCount: clientsCount
    };
  }, [proformas]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar Izquierdo */}
      <Sidebar 
        currentTab="proformas" 
        onSelectTab={(tab) => {
          if (onNavigateTab) {
            onNavigateTab(tab);
          } else {
            setCurrentTab(tab);
          }
        }} 
        onNewProforma={onNewProforma} 
      />

      {/* Área Principal de Contenido */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
            Historial de Proformas
          </h1>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Buscador idéntico al mockup */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente o código..."
                className="w-full sm:w-72 bg-white sm:bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all shadow-none"
              />
            </div>

            {/* Campana de Notificaciones idéntica al mockup */}
            <button 
              type="button" 
              className="w-10 h-10 rounded-xl sm:rounded-full bg-[#FFFBEB] hover:bg-amber-100 text-[#D97706] flex items-center justify-center border border-amber-200/50 shadow-none transition-colors shrink-0"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4 fill-amber-500 stroke-amber-600" />
            </button>
          </div>
        </div>

        {/* 3 Tarjetas de Métricas Superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {/* Card 1: Total Cotizado (Mes) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Total Cotizado (Mes)
            </span>
            <span className="block text-2xl font-display font-bold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(metrics.totalMonth).replace('.00', '')}
            </span>
          </div>

          {/* Card 2: Proformas Activas */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Proformas Activas
            </span>
            <span className="block text-2xl font-display font-bold text-slate-900 tracking-tight tabular-nums">
              {metrics.activeCount}
            </span>
          </div>

          {/* Card 3: Clientes Cotizados (Mes) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Clientes Cotizados (Mes)
            </span>
            <span className="block text-2xl font-display font-bold text-[#0e692e] tracking-tight tabular-nums">
              {metrics.clientsCount}
            </span>
          </div>
        </div>

        {/* Tabla de Proformas */}
        <ProformaTable
          proformas={filteredProformas}
          onShare={(p) => setSelectedProformaForShare(p)}
          onEdit={onEditProforma}
          onDuplicate={onDuplicateProforma}
          onChangeStatus={onChangeStatus}
          onDownloadPdf={onDownloadPdf}
          onDelete={onDeleteProforma}
        />
      </main>

      {/* Modal de Compartir */}
      <ShareModal
        isOpen={Boolean(selectedProformaForShare)}
        onClose={() => setSelectedProformaForShare(null)}
        proforma={selectedProformaForShare}
        onDownloadPdf={onDownloadPdf}
      />
    </div>
  );
}
