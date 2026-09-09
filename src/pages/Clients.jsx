import React, { useState, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ClientModal from '../components/clients/ClientModal';
import ClientDetailDrawer from '../components/clients/ClientDetailDrawer';
import { 
  Bell, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  MessageCircle, 
  Eye, 
  Edit3, 
  Trash2,
  Building2,
  UserCheck
} from 'lucide-react';
import { formatCurrency, getWhatsAppCleanPhone } from '../utils/formatters';

export default function Clients({
  clients = [],
  proformas = [],
  onNewClient,
  onEditClient,
  onDeleteClient,
  onQuoteForClient,
  onNavigateTab,
  onNewProforma,
  properties = [],
  onDownloadPdf
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'cotizados'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedDrawerClient, setSelectedDrawerClient] = useState(null);

  // Calcular proformas por cliente
  const getClientProformasData = (client) => {
    const list = proformas.filter(p => 
      (p.client?.docNumber && client.docNumber && p.client?.docNumber === client.docNumber) ||
      p.client?.name?.toLowerCase().trim() === client.name?.toLowerCase().trim()
    );
    const sum = list.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    return { count: list.length, sum, proformas: list };
  };

  // Filtrado de clientes (Solo: Todos los Clientes y Cotizados)
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filtro de texto
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        client.name?.toLowerCase().includes(q) ||
        client.docNumber?.includes(q) ||
        client.city?.toLowerCase().includes(q) ||
        client.interestProject?.toLowerCase().includes(q) ||
        client.phone?.includes(q)
      );

      // Filtro de píldora: únicamente 'all' o 'cotizados'
      let matchesFilter = true;
      if (filterStatus === 'cotizados') {
        const data = getClientProformasData(client);
        matchesFilter = data.count > 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [clients, proformas, searchQuery, filterStatus]);

  // Métricas simplificadas para el cotizador
  const metrics = useMemo(() => {
    const totalCount = clients.length;
    const quotedClients = clients.filter(c => getClientProformasData(c).count > 0);
    const totalAmount = clients.reduce((sum, c) => sum + getClientProformasData(c).sum, 0);

    return {
      totalCount: totalCount,
      quotedCount: quotedClients.length,
      totalAmount: totalAmount
    };
  }, [clients, proformas]);

  const handleOpenNewModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client, e) => {
    if (e) e.stopPropagation();
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClientModal = async (clientData) => {
    if (editingClient) {
      await onEditClient(clientData);
    } else {
      await onNewClient(clientData);
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleOpenWhatsApp = (client, e) => {
    if (e) e.stopPropagation();
    const cleanPhone = getWhatsAppCleanPhone(client.phone);
    const message = encodeURIComponent(
      `Hola ${client.name}, le saluda Daniel Balarezo de Valle Pacora. Le contacto respecto a su cotización para ${client.interestProject || 'nuestro proyecto'}. ¿Tiene alguna consulta adicional?`
    );
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${message}` 
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
  };

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

  const getInitials = (name) => {
    if (!name) return 'CL';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar Izquierdo */}
      <Sidebar 
        currentTab="clientes" 
        onSelectTab={onNavigateTab} 
        onNewProforma={onNewProforma} 
      />

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              Directorio de Clientes
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión comercial de prospectos, clientes e historial de cotizaciones de Valle Pacora.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Buscador */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, documento o ciudad..."
                className="w-full sm:w-72 bg-white sm:bg-[#F8FAFC] border border-slate-200/90 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
              />
            </div>

            {/* Botón + Nuevo Cliente */}
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="bg-[#0e692e] hover:bg-[#0a5224] text-white font-display font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Cliente</span>
            </button>

            {/* Notificaciones */}
            <button 
              type="button" 
              className="w-10 h-10 rounded-full bg-[#FFFBEB] hover:bg-amber-100 text-[#D97706] flex items-center justify-center border border-amber-200/50 transition-colors"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4 fill-amber-500 stroke-amber-600" />
            </button>
          </div>
        </div>

        {/* 3 Tarjetas de Métricas Superiores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Clientes */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Total Clientes Registrados
            </span>
            <span className="block text-2xl font-display font-bold text-slate-900 tracking-tight tabular-nums">
              {metrics.totalCount}
            </span>
          </div>

          {/* Card 2: Clientes Cotizados */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Clientes Cotizados
            </span>
            <span className="block text-2xl font-display font-bold text-[#0e692e] tracking-tight tabular-nums">
              {metrics.quotedCount}
            </span>
          </div>

          {/* Card 3: Monto Total Cotizado */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Monto Total Cotizado
            </span>
            <span className="block text-2xl font-display font-bold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(metrics.totalAmount).replace('.00', '')}
            </span>
          </div>
        </div>

        {/* Filtros tipo píldora: ÚNICAMENTE 'Todos los Clientes' y 'Cotizados' */}
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#0e692e] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Todos los Clientes
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('cotizados')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'cotizados'
                ? 'bg-[#0e692e] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            Cotizados
          </button>
        </div>

        {/* Tabla de Clientes */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F8FAFC]/60">
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Cliente / Razón Social
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Contacto & Ciudad
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Proyecto de Interés
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Cotizaciones
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No se encontraron clientes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const quotesData = getClientProformasData(client);
                    return (
                      <tr 
                        key={client.id}
                        onClick={() => setSelectedDrawerClient(client)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Cliente */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#eef7f2] text-[#0e692e] font-display font-bold text-xs flex items-center justify-center shrink-0 border border-[#c7ecd5]">
                              {getInitials(client.name)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block group-hover:text-[#0e692e] transition-colors">
                                {client.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {client.docType}: {client.docNumber || 'S/N'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contacto */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-mono text-slate-800 block">
                              {client.phone}
                            </span>
                            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-300" /> {client.city || 'Chiclayo'}
                            </span>
                          </div>
                        </td>

                        {/* Proyecto de Interés */}
                        <td className="py-4 px-6 max-w-xs">
                          <span className="font-medium text-slate-800 block truncate" title={client.interestProject}>
                            {client.interestProject}
                          </span>
                          {client.budget > 0 && (
                            <span className="text-[11px] text-[#0e692e] font-display font-semibold tabular-nums">
                              Presupuesto: {formatCurrency(client.budget).replace('.00', '')}
                            </span>
                          )}
                        </td>

                        {/* Cotizaciones Asociadas */}
                        <td className="py-4 px-6">
                          {quotesData.count > 0 ? (
                            <div>
                              <span className="font-display font-bold text-slate-900 tabular-nums block">
                                {formatCurrency(quotesData.sum).replace('.00', '')}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {quotesData.count} {quotesData.count === 1 ? 'cotización' : 'cotizaciones'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              Sin cotizar
                            </span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-6">
                          {getStatusBadge(quotesData.count > 0)}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botón Cotizar */}
                            <button
                              type="button"
                              onClick={() => onQuoteForClient(client)}
                              title="Generar nueva proforma para este cliente"
                              className="px-2.5 py-1.5 rounded-lg bg-[#eef7f2] hover:bg-[#d8eedf] text-[#0e692e] font-display font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Cotizar</span>
                            </button>

                            {/* Botón WhatsApp */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenWhatsApp(client, e)}
                              title="Abrir WhatsApp"
                              className="p-1.5 text-slate-400 hover:text-[#25D366] hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* Botón Ver Detalle */}
                            <button
                              type="button"
                              onClick={() => setSelectedDrawerClient(client)}
                              title="Ver ficha completa"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Botón Editar */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditModal(client, e)}
                              title="Editar cliente"
                              className="p-1.5 text-slate-400 hover:text-[#0e692e] hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Botón Eliminar */}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Estás seguro de eliminar a ${client.name}?`)) {
                                  onDeleteClient(client.id);
                                }
                              }}
                              title="Eliminar cliente"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Crear / Editar Cliente */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
        onSave={handleSaveClientModal}
        properties={properties}
      />

      {/* Drawer de Detalle y Ficha de Cliente */}
      <ClientDetailDrawer
        isOpen={Boolean(selectedDrawerClient)}
        onClose={() => setSelectedDrawerClient(null)}
        client={selectedDrawerClient}
        proformas={proformas}
        onQuoteClient={(c) => {
          setSelectedDrawerClient(null);
          onQuoteForClient(c);
        }}
        onEditClient={(c) => {
          setSelectedDrawerClient(null);
          handleOpenEditModal(c);
        }}
        onDownloadPdf={onDownloadPdf}
      />
    </div>
  );
}
