import React, { useState } from 'react';
import { Plus, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentTab, onSelectTab, onNewProforma }) {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'proformas', label: 'Proformas' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'plantillas', label: 'Plantillas' },
    { id: 'documentos', label: 'Documentos' },
    { id: 'configuracion', label: 'Configuración' }
  ];

  const handleSelectTab = (tabId) => {
    onSelectTab(tabId);
    setIsMobileOpen(false);
  };

  const handleNewProformaClick = () => {
    onNewProforma();
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* ================= BARRA SUPERIOR EN MÓVIL (< md) ================= */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
          <img 
            src="/logo_valle_pacora.png" 
            alt="Valle Pacora" 
            className="h-8 w-auto object-contain cursor-pointer"
            onClick={() => handleSelectTab('proformas')}
          />
        </div>

        <button
          onClick={handleNewProformaClick}
          className="bg-[#0e692e] hover:bg-[#0a5224] text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva</span>
        </button>
      </div>

      {/* ================= DRAWER MÓVIL CON FONDO OSCURO (< md) ================= */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop oscuro */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Menú Deslizante */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Header Drawer */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <img 
                  src="/logo_valle_pacora.png" 
                  alt="Valle Pacora" 
                  className="h-10 w-auto object-contain" 
                  onClick={() => handleSelectTab('proformas')}
                />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Botón Nueva Proforma */}
              <button
                onClick={handleNewProformaClick}
                className="w-full bg-[#0e692e] hover:bg-[#0a5224] text-white font-display font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm mb-6 active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nueva Proforma</span>
              </button>

              {/* Menú */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#eef7f2] text-[#0e692e] font-semibold'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Perfil en la parte inferior */}
            <div className="pt-6 border-t border-slate-100 flex items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#CBD5E1] text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'DB'}
                </div>
                <div className="overflow-hidden min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">
                    {user?.name || 'Daniel Balarezo'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {user?.role || 'Asesor Comercial'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR ESCRITORIO (>= md) ================= */}
      <aside className="hidden md:flex w-64 min-h-screen bg-white border-r border-slate-100 flex-col justify-between p-6 shrink-0">
        <div>
          {/* Logo & Brand Name */}
          <div className="flex justify-center items-center mb-6 py-1 cursor-pointer" onClick={() => onSelectTab('proformas')}>
            <img 
              src="/logo_valle_pacora.png" 
              alt="Valle Pacora" 
              className="h-14 w-auto object-contain transition-transform hover:scale-[1.03]" 
            />
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onNewProforma}
            className="w-full bg-[#0e692e] hover:bg-[#0a5224] text-white font-display font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-150 text-sm mb-6 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Proforma</span>
          </button>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#eef7f2] text-[#0e692e] font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Advisor Profile at Bottom */}
        <div className="pt-6 border-t border-slate-100 flex items-center">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#CBD5E1] text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0">
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'DB'}
            </div>
            <div className="overflow-hidden min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">
                {user?.name || 'Daniel Balarezo'}
              </h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {user?.role || 'Asesor Comercial'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
