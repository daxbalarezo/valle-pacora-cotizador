import React, { useState, useEffect, useMemo } from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';
import { getProformaNotificationData } from '../../utils/notifications';

export default function NotificationPopup() {
  const { proformas = [] } = useGlobalContext();
  const [isVisible, setIsVisible] = useState(false);
  
  const notifications = useMemo(() => getProformaNotificationData(proformas), [proformas]);
  
  useEffect(() => {
    // Solo mostrar si hay notificaciones y no se ha mostrado en esta sesión
    if (notifications.length > 0) {
      const hasSeenPopup = sessionStorage.getItem('valle_pacora_seen_notification_popup');
      if (!hasSeenPopup) {
        // Pequeño retraso para que la carga de la app sea limpia antes de mostrar el modal
        const timer = setTimeout(() => {
          setIsVisible(true);
          sessionStorage.setItem('valle_pacora_seen_notification_popup', 'true');
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications.length]);

  if (!isVisible || notifications.length === 0) return null;

  // Resumen
  const countProximas = notifications.filter(n => n.group === 'PRÓXIMA A VENCER').length;
  const countVencidas = notifications.filter(n => n.group === 'VENCIDA').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop oscuro */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsVisible(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-amber-600 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">Seguimiento Comercial</h3>
              </div>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-slate-600 mb-5">
            Tienes <strong className="text-slate-900">{notifications.length} proformas</strong> que requieren atención:
          </p>
          
          <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {countProximas > 0 && (
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="w-5 text-center">🟠</span>
                <span className="text-orange-700">{countProximas} próxima{countProximas > 1 ? 's' : ''} a vencer (0-3 días)</span>
              </div>
            )}
            {countVencidas > 0 && (
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="w-5 text-center">⚫</span>
                <span className="text-slate-600">{countVencidas} vencida{countVencidas > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="w-full bg-[#0e692e] hover:bg-[#0a5224] text-white font-display font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Ver notificaciones</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
