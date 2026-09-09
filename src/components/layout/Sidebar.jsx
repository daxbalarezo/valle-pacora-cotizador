import React from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentTab, onSelectTab, onNewProforma }) {
  const { user } = useAuth();

  const menuItems = [
    { id: 'proformas', label: 'Proformas' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'plantillas', label: 'Plantillas' },
    { id: 'documentos', label: 'Documentos' },
    { id: 'configuracion', label: 'Configuración' }
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0">
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
  );
}
