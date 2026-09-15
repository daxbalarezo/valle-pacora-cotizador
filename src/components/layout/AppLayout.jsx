import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useGlobalContext } from '../../context/GlobalContext';
import { useAuth } from '../../context/AuthContext';
import { generateToken } from '../../utils/formatters';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { advisors, config, properties, proformas, setSelectedProforma } = useGlobalContext() || {};

  // Determinar la pestaña actual basándonos en la ruta
  let currentTab = 'proformas';
  if (location.pathname.startsWith('/clientes')) currentTab = 'clientes';
  if (location.pathname.startsWith('/plantillas')) currentTab = 'plantillas';
  if (location.pathname.startsWith('/documentos')) currentTab = 'documentos';
  if (location.pathname.startsWith('/configuracion')) currentTab = 'configuracion';

  const handleSelectTab = (tab) => {
    if (tab === 'proformas') navigate('/');
    else if (tab === 'clientes') navigate('/clientes');
    else if (tab === 'plantillas') navigate('/plantillas');
    else if (tab === 'documentos') navigate('/documentos');
    else if (tab === 'configuracion') navigate('/configuracion');
  };

  const handleNewProforma = () => {
    // Replicar la lógica original de handleNewProforma desde App.jsx
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
    const initialProperty = properties?.[0];

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
      updatedAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      client: {
        name: '',
        docType: 'DNI',
        docNumber: '',
        email: '',
        phone: '',
        validDays: '7 días hábiles'
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: initialProperty?.title || 'Parcela Agrícola - Palta Hass (1,000 m²)',
          quantity: 1,
          unitPrice: initialProperty?.basePrice || 60000.00,
          discount: 0,
          total: initialProperty?.basePrice || 60000.00
        }
      ],
      includeFloorPlan: true,
      selectedPropertyId: initialProperty?.id || 'parcela-palta-1000',
      subtotal: initialProperty?.basePrice || 60000.00,
      totalDiscount: 0,
      tax: 0,
      total: initialProperty?.basePrice || 60000.00,
      conditions: {
        validDays: 7,
        paymentMethod: 'Financiamiento Directo / Separación con S/ 1,000',
        notes: 'Modalidad: Financiado (S/ 60,000).\\nSeparación: S/ 1,000.\\nInicial: S/ 20,000 en 15 días.\\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos.\\nValidez: 7 días calendarios.'
      },
      publicToken: generateToken()
    };

    if (setSelectedProforma) {
      setSelectedProforma(newProforma);
      navigate('/crear');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      <Sidebar 
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onNewProforma={handleNewProforma}
      />
      <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
        <Outlet />
      </div>
    </div>
  );
}
