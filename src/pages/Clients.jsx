import React, { useState, useMemo } from 'react';
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
import { formatCurrency, getWhatsAppCleanPhone, generateToken } from '../utils/formatters';
import { useGlobalContext } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { downloadProformaPdf } from '../utils/pdfGenerator';

export default function Clients() {
  const {
    clients = [],
    proformas = [],
    properties = [],
    handleNewClient,
    handleEditClient,
    handleDeleteClient,
    setSelectedProforma,
    advisors = [],
    config
  } = useGlobalContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'cotizados'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedDrawerClient, setSelectedDrawerClient] = useState(null);

  const onQuoteForClient = (client) => {
    const activeAdvisors = (advisors && advisors.length > 0) ? advisors : [];
    const defaultAdvisor = activeAdvisors.find(a => a.isDefault) || activeAdvisors[0] || {
      id: 'advisor-1',
      name: user?.name || config?.advisor?.name || 'Daniel Balarezo',
      phone: user?.phone || config?.advisor?.phone || '+51 987 654 321',
      role: user?.role || config?.advisor?.role || 'Asesor Comercial Especializado',
      email: user?.email || config?.advisor?.email || 'daniel.balarezo@vallepacora.pe'
    };

    const maxCode = (proformas || []).reduce((max, p) => {
      const match = p.code?.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 1000;
      return num > max ? num : max;
    }, 1000);
    const nextCodeNumber = maxCode + 1;
    const initialProperty = properties[0];

    const newProforma = {
      id: `cot-${nextCodeNumber}`,
      code: `#COT-${nextCodeNumber}`,
      advisorId: defaultAdvisor.id || 'advisor-1',
      advisorName: defaultAdvisor.name || 'Daniel Balarezo',
      advisorPhone: defaultAdvisor.phone || '+51 987 654 321',
      advisorRole: defaultAdvisor.role || 'Asesor Comercial Especializado',
      advisorEmail: defaultAdvisor.email || 'daniel.balarezo@vallepacora.pe',
      status: 'borrador',
      currency: 'PEN',
      createdAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      client: {
        name: client.name,
        docType: client.docType || 'DNI',
        docNumber: client.docNumber || '',
        email: client.email || '',
        phone: client.phone || '',
        validDays: '7 días hábiles'
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: client.interestProject || initialProperty?.title || 'Parcela Agrícola - Palta Hass (1,000 m²)',
          quantity: 1,
          unitPrice: client.budget || initialProperty?.basePrice || 60000.00,
          discount: 0,
          total: client.budget || initialProperty?.basePrice || 60000.00
        }
      ],
      includeFloorPlan: Boolean(initialProperty?.planImageUrl),
      selectedPropertyId: initialProperty?.id || 'parcela-palta-1000',
      subtotal: client.budget || 60000.00,
      totalDiscount: 0,
      tax: 0,
      total: client.budget || 60000.00,
      conditions: {
        validDays: 7,
        paymentType: 'financiado',
        reservation: 1000,
        initialPayment: 20000,
        balance: 40000,
        months: 24,
        monthlyInstallment: 1666.67,
        paymentMethod: 'Financiamiento Directo / Separación con S/ 1,000',
        notes: client.notes ? `Notas cliente: ${client.notes}\nForma de pago: S/ 1,000 de separación.` : 'Modalidad: Financiado (S/ 60,000).\nSeparación: S/ 1,000.\nInicial: S/ 20,000 en 15 días.\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos.'
      },
      publicToken: generateToken()
    };

    setSelectedProforma(newProforma);
    navigate('/crear');
  };

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

  // Pagination state
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredClients]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
      await handleEditClient(clientData);
    } else {
      await handleNewClient(clientData);
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
    <div className="w-full">
      {/* Contenido Principal */}
      <div className="w-full">
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
          {/* ================= VISTA ESCRITORIO (>= md) ================= */}
          <div className="hidden md:block overflow-x-auto">
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
                  paginatedClients.map((client) => {
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

          {/* ================= VISTA MÓVIL (< md) ================= */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredClients.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No se encontraron clientes con los filtros seleccionados.
              </div>
            ) : (
              paginatedClients.map((client) => {
                const quotesData = getClientProformasData(client);
                return (
                  <div 
                    key={client.id}
                    onClick={() => setSelectedDrawerClient(client)}
                    className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer space-y-2.5 active:bg-slate-50"
                  >
                    {/* Fila 1: Avatar + Nombre + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#eef7f2] text-[#0e692e] font-display font-bold text-xs flex items-center justify-center shrink-0 border border-[#c7ecd5]">
                          {getInitials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block text-xs truncate">
                            {client.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {client.docType}: {client.docNumber || 'S/N'}
                          </span>
                        </div>
                      </div>

                      {getStatusBadge(quotesData.count > 0)}
                    </div>

                    {/* Fila 2: Teléfono, Ciudad y Cotizaciones */}
                    <div className="bg-slate-50/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <span className="font-mono text-slate-800 text-[11px] block">
                          {client.phone || 'Sin teléfono'}
                        </span>
                        <span className="text-[10px] text-slate-400 inline-flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-300" /> {client.city || 'Chiclayo'}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        {quotesData.count > 0 ? (
                          <>
                            <span className="font-display font-bold text-slate-900 text-xs block tabular-nums">
                              {formatCurrency(quotesData.sum).replace('.00', '')}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {quotesData.count} {quotesData.count === 1 ? 'cotización' : 'cotizaciones'}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic text-[10px] block">
                            Sin cotizar
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fila 3: Proyecto y Acciones Rápidas */}
                    <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                        {client.interestProject || 'Valle Pacora'}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onQuoteForClient(client)}
                          className="px-2.5 py-1 rounded-lg bg-[#eef7f2] hover:bg-[#d8eedf] text-[#0e692e] font-semibold text-[11px] flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Cotizar</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleOpenWhatsApp(client, e)}
                          className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E]"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ================= PAGINATION CONTROLS ================= */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-white gap-4">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)} de {filteredClients.length} clientes
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] sm:max-w-none scrollbar-hide">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`shrink-0 w-7 h-7 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                        currentPage === page 
                          ? 'bg-[#0e692e] text-white' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
        onDownloadPdf={downloadProformaPdf}
      />
    </div>
  );
}
