import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, User, CheckCircle2 } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';
import { getProformaNotificationData } from '../../utils/notifications';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter() {
  const { proformas = [], setSelectedProforma } = useGlobalContext();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filterGroup, setFilterGroup] = useState('Todas');
  const [filterAdvisor, setFilterAdvisor] = useState('Todos');
  const dropdownRef = useRef(null);

  const notifications = useMemo(() => getProformaNotificationData(proformas), [proformas]);
  
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options
  const advisors = useMemo(() => {
    const unique = new Set(notifications.map(n => n.advisorName?.trim()).filter(Boolean));
    return ['Todos', ...Array.from(unique)];
  }, [notifications]);

  const groupOptions = ['Todas', 'PRÓXIMA A VENCER', 'VENCIDA'];

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchGroup = filterGroup === 'Todas' || n.group === filterGroup;
      const matchAdvisor = filterAdvisor === 'Todos' || n.advisorName?.trim() === filterAdvisor;
      return matchGroup && matchAdvisor;
    });
  }, [notifications, filterGroup, filterAdvisor]);

  const unreadCount = notifications.length;
  
  const totalValue = useMemo(() => {
    return notifications.reduce((sum, n) => sum + (Number(n.total) || 0), 0);
  }, [notifications]);

  const handleOpenProforma = (proforma) => {
    setIsOpen(false);
    if (setSelectedProforma) {
      setSelectedProforma(proforma);
      navigate('/crear');
    }
  };

  const getGroupStyles = (group) => {
    switch (group) {
      case 'PRÓXIMA A VENCER': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🟠' };
      case 'VENCIDA': return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: '⚫' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '⚪' };
    }
  };

  const getDaysText = (diffDays) => {
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    if (diffDays > 1) return `Vence en ${diffDays} días`;
    if (diffDays === -1) return 'Venció ayer';
    if (diffDays < -1) return `Venció hace ${Math.abs(diffDays)} días`;
    return '';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl sm:rounded-full bg-[#FFFBEB] hover:bg-amber-100 text-[#D97706] flex items-center justify-center border border-amber-200/50 shadow-none transition-colors shrink-0"
        title="Notificaciones"
      >
        <Bell className="w-4 h-4 fill-amber-500 stroke-amber-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-screen max-w-[360px] sm:max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[600px]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1 shrink-0">
            <h3 className="font-display font-bold text-slate-900 text-base">Seguimiento Comercial</h3>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-rose-600">{unreadCount} proformas pendientes</p>
              <p className="text-xs font-bold text-slate-700 tabular-nums" title="Valor total de oportunidades">
                Total: {formatCurrency(totalValue, 'PEN')}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-white">
            <select 
              value={filterGroup} 
              onChange={e => setFilterGroup(e.target.value)}
              className="text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20"
            >
              {groupOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            
            <select 
              value={filterAdvisor} 
              onChange={e => setFilterAdvisor(e.target.value)}
              className="text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 max-w-[120px] truncate"
            >
              {advisors.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3">
            {filteredNotifications.length === 0 ? (
              <div className="px-5 py-10 text-center flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                <p className="text-sm font-semibold text-slate-700">Todo al día</p>
                <p className="text-xs text-slate-500 mt-1">No hay proformas que requieran atención con estos filtros.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredNotifications.map(notif => {
                  const styles = getGroupStyles(notif.group);
                  const clientName = notif.client?.name?.trim() || 'Cliente Particular';
                  
                  return (
                    <div 
                      key={notif.id}
                      onClick={() => handleOpenProforma(notif)}
                      className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-[#0e692e]/30 transition-all cursor-pointer flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs shrink-0">{styles.icon}</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
                            {notif.group}
                          </span>
                          <span className="text-slate-300 mx-0.5">•</span>
                          <span className="text-xs font-display font-bold text-[#0e692e] shrink-0">
                            {notif.code}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${styles.bg} ${styles.text} whitespace-nowrap shrink-0`}>
                          {getDaysText(notif.diffDays)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {clientName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                            <User className="w-3 h-3" />
                            <span className="truncate">{notif.advisorName || 'Asesor'}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-900 tabular-nums">
                            {formatCurrency(notif.total, notif.currency)}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Emisión: {notif.emissionDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Vence: {notif.expirationDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
