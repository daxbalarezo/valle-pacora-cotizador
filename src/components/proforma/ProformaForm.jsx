import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Home, 
  FileText, 
  Check, 
  Users, 
  User,
  Phone,
  Mail,
  Briefcase,
  Search, 
  X, 
  Clock, 
  UserCheck, 
  ChevronDown,
  Calculator,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatPhoneNumber, normalizeName, liveCapitalizeName } from '../../utils/formatters';
import { INITIAL_TEMPLATES, storageService } from '../../services/storageService';

export default function ProformaForm({
  proforma,
  onChange,
  properties = [],
  clients = [],
  templates = [],
  advisors = [],
  onSelectProperty
}) {
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [showCustomAmounts, setShowCustomAmounts] = useState(false);
  const clientSearchRef = useRef(null);

  // Asesores disponibles tomados directamente de la configuración (Equipo de Asesores)
  const availableAdvisors = useMemo(() => {
    const filterClean = (list) => {
      if (!Array.isArray(list)) return [];
      return list.filter(a => a.name !== 'Janet Morales' && a.name !== 'Carlos Mendoza');
    };

    let list = filterClean(advisors);
    if (list.length === 0) {
      const cfg = storageService.getConfigSync();
      list = filterClean(cfg?.advisors);
    }
    if (list.length === 0) {
      list = [
        {
          id: 'advisor-1',
          name: 'Daniel Balarezo',
          role: 'Asesor Comercial Especializado',
          phone: '+51 987 654 321',
          email: 'daniel.balarezo@vallepacora.pe',
          isDefault: true
        }
      ];
    }
    return list;
  }, [advisors]);

  // Asesor actualmente seleccionado en la proforma
  const currentAdvisor = useMemo(() => {
    if (proforma.advisorId) {
      const match = availableAdvisors.find(a => a.id === proforma.advisorId);
      if (match) return match;
    }
    if (proforma.advisorName) {
      const match = availableAdvisors.find(a => a.name?.toLowerCase().trim() === proforma.advisorName?.toLowerCase().trim());
      if (match) return match;
    }
    return availableAdvisors.find(a => a.isDefault) || availableAdvisors[0] || null;
  }, [availableAdvisors, proforma.advisorId, proforma.advisorName]);

  // Si la proforma no tiene asesor asignado, asignar el predeterminado al montar
  useEffect(() => {
    if (!proforma.advisorId && currentAdvisor) {
      onChange({
        ...proforma,
        advisorId: currentAdvisor.id,
        advisorName: currentAdvisor.name,
        advisorRole: currentAdvisor.role || 'Asesor Comercial Especializado',
        advisorPhone: currentAdvisor.phone || '+51 987 654 321',
        advisorEmail: currentAdvisor.email || ''
      });
    }
  }, []);

  const handleSelectAdvisor = (advisorId) => {
    const adv = availableAdvisors.find(a => a.id === advisorId);
    if (!adv) return;
    onChange({
      ...proforma,
      advisorId: adv.id,
      advisorName: adv.name,
      advisorRole: adv.role || 'Asesor Comercial Especializado',
      advisorPhone: adv.phone || '+51 987 654 321',
      advisorEmail: adv.email || ''
    });
  };

  // Exactamente las 4 plantillas oficiales (2 Contado, 2 Financiados)
  const availableTemplates = useMemo(() => {
    const list = (templates && templates.length > 0) ? templates : INITIAL_TEMPLATES;
    return list.filter(t => t.id !== 'tpl-separacion-provincia');
  }, [templates]);

  // Cerrar el menú desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(event.target)) {
        setIsClientSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrado predictivo reactivo para escalabilidad (100+ clientes)
  const filteredClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    const q = clientSearchQuery.toLowerCase().trim();
    if (!q) {
      // Clientes recientes (primeros 5)
      return clients.slice(0, 5);
    }
    return clients.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const doc = (c.docNumber || c.dni || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      return name.includes(q) || doc.includes(q) || phone.includes(q) || email.includes(q) || city.includes(q);
    }).slice(0, 8);
  }, [clients, clientSearchQuery]);

  // Cliente actualmente vinculado con la cotización
  const currentClientMatch = useMemo(() => {
    if (!proforma.client?.name && !proforma.client?.docNumber) return null;
    return clients.find((c) =>
      (proforma.client?.docNumber && (c.docNumber === proforma.client.docNumber || c.dni === proforma.client.docNumber)) ||
      (proforma.client?.name && c.name && c.name.toLowerCase().trim() === proforma.client.name.toLowerCase().trim())
    );
  }, [clients, proforma.client]);

  const totalAmount = Number(proforma.total) || 60000;
  const conditions = proforma.conditions || {};
  const paymentType = conditions.paymentType || 'financiado';
  const defaultInitial = totalAmount >= 80000 ? 45000 : 20000;
  const initialPayment = conditions.initialPayment !== undefined ? Number(conditions.initialPayment) : defaultInitial;
  const reservation = conditions.reservation !== undefined ? Number(conditions.reservation) : 1000;
  const months = conditions.months !== undefined ? Number(conditions.months) : 24;
  const balance = Math.max(0, totalAmount - initialPayment);
  const monthlyInstallment = months > 0 ? balance / months : 0;

  // Identificador de la plantilla activa
  const currentTemplateId = useMemo(() => {
    if (proforma.selectedTemplateId) return proforma.selectedTemplateId;

    const isContado = paymentType === 'contado' || Number(proforma.total) === 57000;
    const isArandano =
      (proforma.selectedPropertyId && proforma.selectedPropertyId.includes('arandano')) ||
      (proforma.items && proforma.items.some(it =>
        (it.description || '').toLowerCase().includes('arándano') ||
        (it.description || '').toLowerCase().includes('arandano')
      ));

    if (isArandano) {
      return isContado ? 'tpl-arandano-contado' : 'tpl-arandano-financiado';
    } else {
      return isContado ? 'tpl-palta-contado' : 'tpl-palta-financiado';
    }
  }, [proforma.selectedTemplateId, paymentType, proforma.total, proforma.selectedPropertyId, proforma.items]);

  const handleSelectTemplate = (templateId) => {
    const tpl = availableTemplates.find(t => t.id === templateId);
    if (!tpl) return;

    const prop = properties.find(p => p.id === tpl.propertyId) || 
                 properties.find(p => p.category === tpl.category) || 
                 properties[0];

    const isContado = tpl.paymentType === 'contado' || tpl.title.toLowerCase().includes('contado');
    const unitPrice = Number(tpl.unitPrice) || (isContado ? (tpl.crop === 'arandano' ? 60000 : 57000) : (tpl.crop === 'arandano' ? 85000 : 60000));
    const total = unitPrice;
    const reservation = Number(tpl.reservation) || 1000;
    const initialPayment = isContado ? total : (Number(tpl.initialPayment) || (total >= 80000 ? 45000 : 20000));
    const balance = isContado ? 0 : Math.max(0, total - initialPayment);
    const months = isContado ? 0 : (Number(tpl.months) || 24);
    const installment = months > 0 ? balance / months : 0;

    const formattedInstallment = formatCurrency(installment, proforma.currency).replace('.00', '');
    const formattedTotal = formatCurrency(total, proforma.currency).replace('.00', '');
    const formattedReservation = formatCurrency(reservation, proforma.currency).replace('.00', '');
    const formattedInitial = formatCurrency(initialPayment, proforma.currency).replace('.00', '');
    const formattedBalance = formatCurrency(balance, proforma.currency).replace('.00', '');

    const generatedNotes = isContado
      ? `Modalidad: Pago al Contado (${formattedTotal}).\nSeparación: ${formattedReservation}.\nSaldo: ${formatCurrency(Math.max(0, total - reservation), proforma.currency).replace('.00', '')} contra firma de contrato y minuta en notaría.`
      : `Modalidad: Financiado (${formattedTotal}).\nSeparación: ${formattedReservation}.\nInicial: ${formattedInitial} en 15 días.\nSaldo: ${formattedBalance} financiado en cuotas directas sin bancos.`;

    const newItem = {
      id: `item-${Date.now()}`,
      description: tpl.category === 'Palta Hass'
        ? 'Parcela Agrícola - Palta Hass (1,000 m²)'
        : 'Parcela Agrícola - Arándanos (1,000 m²)',
      quantity: 1,
      unitPrice: unitPrice,
      discount: 0,
      total: unitPrice
    };

    if (onSelectProperty && prop?.id) {
      onSelectProperty(prop.id);
    }

    onChange({
      ...proforma,
      selectedTemplateId: tpl.id,
      selectedPropertyId: prop?.id || tpl.propertyId || 'parcela-palta-1000',
      items: [newItem],
      subtotal: unitPrice,
      totalDiscount: 0,
      tax: 0,
      total: unitPrice,
      includeFloorPlan: true,
      conditions: {
        ...proforma.conditions,
        paymentType: isContado ? 'contado' : 'financiado',
        reservation: reservation,
        initialPayment: initialPayment,
        balance: balance,
        months: months,
        monthlyInstallment: installment,
        notes: tpl.conditions || generatedNotes
      }
    });
    setShowCustomAmounts(false);
  };

  const updateFinancing = (overrides = {}) => {
    const nextReservation = overrides.reservation !== undefined ? Number(overrides.reservation) : reservation;
    const nextInitial = overrides.initialPayment !== undefined ? Number(overrides.initialPayment) : initialPayment;
    const nextMonths = overrides.months !== undefined ? Number(overrides.months) : months;

    const nextBalance = Math.max(0, totalAmount - nextInitial);
    const nextInstallment = nextMonths > 0 ? nextBalance / nextMonths : 0;

    const formattedInstallment = formatCurrency(nextInstallment, proforma.currency).replace('.00', '');
    const formattedTotal = formatCurrency(totalAmount, proforma.currency).replace('.00', '');
    const formattedReservation = formatCurrency(nextReservation, proforma.currency).replace('.00', '');
    const formattedInitial = formatCurrency(nextInitial, proforma.currency).replace('.00', '');
    const formattedBalance = formatCurrency(nextBalance, proforma.currency).replace('.00', '');

    const generatedNotes = paymentType === 'contado'
      ? `Modalidad: Pago al Contado (${formattedTotal}).\nSeparación: ${formattedReservation}.\nSaldo: ${formatCurrency(Math.max(0, totalAmount - nextReservation), proforma.currency).replace('.00', '')} contra firma de contrato y minuta en notaría.`
      : `Modalidad: Financiado (${formattedTotal}).\nSeparación: ${formattedReservation}.\nInicial: ${formattedInitial} en 15 días.\nSaldo: ${formattedBalance} financiado en cuotas directas sin bancos.`;

    onChange({
      ...proforma,
      conditions: {
        ...proforma.conditions,
        paymentType,
        reservation: nextReservation,
        initialPayment: nextInitial,
        balance: nextBalance,
        months: nextMonths,
        monthlyInstallment: nextInstallment,
        notes: overrides.notes !== undefined ? overrides.notes : generatedNotes
      }
    });
  };

  const handleClientChange = (field, value) => {
    onChange({
      ...proforma,
      client: {
        ...proforma.client,
        [field]: value
      }
    });
  };

  const handleSelectClient = (selectedClient) => {
    if (!selectedClient) return;
    onChange({
      ...proforma,
      client: {
        ...proforma.client,
        name: normalizeName(selectedClient.name || ''),
        docNumber: selectedClient.docNumber || selectedClient.dni || proforma.client?.docNumber || '',
        email: selectedClient.email || proforma.client?.email || '',
        phone: selectedClient.phone ? formatPhoneNumber(selectedClient.phone) : (proforma.client?.phone || ''),
      }
    });
    setClientSearchQuery('');
    setIsClientSearchOpen(false);
  };

  const handleClientNameChange = (value) => {
    const capitalizedValue = liveCapitalizeName(value);
    const matched = clients.find(
      (c) => c.name && c.name.toLowerCase().trim() === capitalizedValue.toLowerCase().trim()
    );
    if (matched) {
      onChange({
        ...proforma,
        client: {
          ...proforma.client,
          name: capitalizedValue,
          docNumber: matched.docNumber || matched.dni || proforma.client?.docNumber || '',
          email: matched.email || proforma.client?.email || '',
          phone: matched.phone ? formatPhoneNumber(matched.phone) : (proforma.client?.phone || ''),
        }
      });
    } else {
      handleClientChange('name', capitalizedValue);
    }
  };

  const handleClientPhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    handleClientChange('phone', formatted);
  };

  const handleDocNumberChange = (value) => {
    const trimmed = value.trim();
    const matched = clients.find(
      (c) =>
        (c.docNumber && c.docNumber.trim() === trimmed) ||
        (c.dni && c.dni.trim() === trimmed)
    );
    if (matched && trimmed.length >= 8) {
      onChange({
        ...proforma,
        client: {
          ...proforma.client,
          docNumber: value,
          name: matched.name ? normalizeName(matched.name) : (proforma.client?.name || ''),
          email: matched.email || proforma.client?.email || '',
          phone: matched.phone ? formatPhoneNumber(matched.phone) : (proforma.client?.phone || ''),
        }
      });
    } else {
      handleClientChange('docNumber', value);
    }
  };

  const handleConditionsChange = (field, value) => {
    onChange({
      ...proforma,
      conditions: {
        ...proforma.conditions,
        [field]: value
      }
    });
  };

  const resetToStandard = () => {
    const tpl = availableTemplates.find(t => t.id === currentTemplateId);
    const standardPrice = tpl && Number(tpl.unitPrice) 
      ? Number(tpl.unitPrice) 
      : (paymentType === 'contado' ? 57000 : 60000);
    const isContado = paymentType === 'contado';
    const standardInitial = isContado ? standardPrice : (tpl && tpl.initialPayment !== undefined ? Number(tpl.initialPayment) : (standardPrice >= 80000 ? 45000 : 20000));
    const standardReservation = 1000;
    const standardMonths = isContado ? 0 : 24;
    const standardBalance = isContado ? 0 : Math.max(0, standardPrice - standardInitial);
    const standardInstallment = standardMonths > 0 ? standardBalance / standardMonths : 0;

    const updatedItems = (proforma.items || []).map((it, i) => i === 0 ? {
      ...it,
      unitPrice: standardPrice,
      total: (it.quantity || 1) * standardPrice
    } : it);

    const subtotal = updatedItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
    const total = subtotal;

    const formattedInstallment = formatCurrency(standardInstallment, proforma.currency).replace('.00', '');
    const formattedTotal = formatCurrency(total, proforma.currency).replace('.00', '');
    const formattedReservation = formatCurrency(standardReservation, proforma.currency).replace('.00', '');
    const formattedInitial = formatCurrency(standardInitial, proforma.currency).replace('.00', '');
    const formattedBalance = formatCurrency(standardBalance, proforma.currency).replace('.00', '');

    const generatedNotes = isContado
      ? `Modalidad: Pago al Contado (${formattedTotal}).\nSeparación: ${formattedReservation}.\nSaldo: ${formatCurrency(Math.max(0, total - standardReservation), proforma.currency).replace('.00', '')} contra firma de contrato y minuta en notaría.`
      : `Modalidad: Financiado (${formattedTotal}).\nSeparación: ${formattedReservation}.\nInicial: ${formattedInitial} en 15 días.\nSaldo: ${formattedBalance} financiado en cuotas directas sin bancos.`;

    onChange({
      ...proforma,
      items: updatedItems,
      subtotal,
      total,
      conditions: {
        ...proforma.conditions,
        reservation: standardReservation,
        initialPayment: standardInitial,
        balance: standardBalance,
        months: standardMonths,
        monthlyInstallment: standardInstallment,
        notes: generatedNotes
      }
    });
  };

  const recalculateConditionsWithTotal = (newTotal, currentConds = {}) => {
    const isContado = currentConds.paymentType === 'contado' || paymentType === 'contado';
    const curReservation = currentConds.reservation !== undefined ? Number(currentConds.reservation) : reservation;
    const curInitial = currentConds.initialPayment !== undefined ? Number(currentConds.initialPayment) : initialPayment;
    const curMonths = currentConds.months !== undefined ? Number(currentConds.months) : months;

    const nextInitial = isContado ? newTotal : Math.min(curInitial, newTotal);
    const nextBalance = isContado ? 0 : Math.max(0, newTotal - nextInitial);
    const nextInstallment = curMonths > 0 ? nextBalance / curMonths : 0;

    const formattedInstallment = formatCurrency(nextInstallment, proforma.currency).replace('.00', '');
    const formattedTotal = formatCurrency(newTotal, proforma.currency).replace('.00', '');
    const formattedReservation = formatCurrency(curReservation, proforma.currency).replace('.00', '');
    const formattedInitial = formatCurrency(nextInitial, proforma.currency).replace('.00', '');
    const formattedBalance = formatCurrency(nextBalance, proforma.currency).replace('.00', '');

    const generatedNotes = isContado
      ? `Modalidad: Pago al Contado (${formattedTotal}).\nSeparación: ${formattedReservation}.\nSaldo: ${formatCurrency(Math.max(0, newTotal - curReservation), proforma.currency).replace('.00', '')} contra firma de contrato y minuta en notaría.`
      : `Modalidad: Financiado (${formattedTotal}).\nSeparación: ${formattedReservation}.\nInicial: ${formattedInitial} en 15 días.\nSaldo: ${formattedBalance} financiado en cuotas directas sin bancos.`;

    return {
      ...currentConds,
      paymentType: isContado ? 'contado' : 'financiado',
      reservation: curReservation,
      initialPayment: nextInitial,
      balance: nextBalance,
      months: curMonths,
      monthlyInstallment: nextInstallment,
      notes: generatedNotes
    };
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...(proforma.items || [])];
    const currentItem = { ...updatedItems[index] };

    if (field === 'quantity') {
      currentItem.quantity = Number(value) || 0;
    } else if (field === 'unitPrice') {
      currentItem.unitPrice = value === '' ? 0 : Number(value);
    } else if (field === 'discount') {
      currentItem.discount = Number(value) || 0;
    } else {
      currentItem[field] = value;
    }

    // Calcular total del ítem
    const qty = currentItem.quantity || 1;
    const price = currentItem.unitPrice || 0;
    const disc = currentItem.discount || 0;
    currentItem.total = Math.max(0, (qty * price) - disc);

    updatedItems[index] = currentItem;

    // Recalcular totales generales
    const subtotal = updatedItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
    const totalDiscount = updatedItems.reduce((acc, it) => acc + (it.discount || 0), 0);
    const taxableBase = Math.max(0, subtotal - totalDiscount);
    const tax = proforma.tax > 0 ? taxableBase * 0.18 : 0;
    const total = taxableBase + tax;

    onChange({
      ...proforma,
      items: updatedItems,
      subtotal,
      totalDiscount,
      total,
      conditions: recalculateConditionsWithTotal(total, proforma.conditions)
    });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: 'Nuevo concepto o lote',
      quantity: 1,
      unitPrice: 10000.00,
      discount: 0,
      total: 10000.00
    };
    const updatedItems = [...(proforma.items || []), newItem];
    const subtotal = updatedItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
    const totalDiscount = updatedItems.reduce((acc, it) => acc + (it.discount || 0), 0);
    const taxableBase = Math.max(0, subtotal - totalDiscount);
    const tax = proforma.tax > 0 ? taxableBase * 0.18 : 0;
    const total = taxableBase + tax;

    onChange({
      ...proforma,
      items: updatedItems,
      subtotal,
      totalDiscount,
      total,
      conditions: recalculateConditionsWithTotal(total, proforma.conditions)
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = proforma.items.filter((_, i) => i !== index);
    const subtotal = updatedItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
    const totalDiscount = updatedItems.reduce((acc, it) => acc + (it.discount || 0), 0);
    const taxableBase = Math.max(0, subtotal - totalDiscount);
    const tax = proforma.tax > 0 ? taxableBase * 0.18 : 0;
    const total = taxableBase + tax;

    onChange({
      ...proforma,
      items: updatedItems,
      subtotal,
      totalDiscount,
      total,
      conditions: recalculateConditionsWithTotal(total, proforma.conditions)
    });
  };

  const toggleFloorPlan = () => {
    onChange({
      ...proforma,
      includeFloorPlan: !proforma.includeFloorPlan
    });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      {/* Selector rápido de catálogo inmobiliario (< 90 segundos) */}
      <div className="mb-6 pb-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-[#0e692e]" />
            Plantilla de Proyecto / Tipología Rápida
          </label>
          <span className="text-[11px] text-slate-400">Autocompleta en 1 clic</span>
        </div>
        <select
          value={currentTemplateId || ''}
          onChange={(e) => handleSelectTemplate(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all cursor-pointer shadow-2xs"
        >
          <option value="">Selecciona una plantilla oficial...</option>
          {availableTemplates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.crop === 'palta' ? '🥑' : '🫐'} {tpl.title}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Asesor Comercial Responsable (Equipo de Asesores) */}
      <div className="mb-6 pb-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#0e692e]" />
            Asesor Comercial Responsable (¿Quién cotiza?)
          </label>
          <span className="text-[11px] text-slate-400">
            {availableAdvisors.length} {availableAdvisors.length === 1 ? 'asesor registrado' : 'asesores registrados'}
          </span>
        </div>

        {/* Si hay más de 1 asesor, selector desplegable rápido */}
        {availableAdvisors.length > 1 && (
          <div className="mb-3">
            <select
              value={currentAdvisor?.id || ''}
              onChange={(e) => handleSelectAdvisor(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all cursor-pointer shadow-2xs"
            >
              {availableAdvisors.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  👤 {adv.name} — {adv.role || 'Asesor Comercial'} ({adv.phone})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tarjetas interactivas de Asesores para elegir haciendo clic */}
        <div className={`grid gap-2.5 ${availableAdvisors.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {availableAdvisors.map((adv) => {
            const isSelected = currentAdvisor?.id ? (currentAdvisor.id === adv.id) : (proforma.advisorName === adv.name);
            return (
              <button
                key={adv.id}
                type="button"
                onClick={() => handleSelectAdvisor(adv.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/90 border-[#0e692e] ring-2 ring-[#0e692e]/25 shadow-xs'
                    : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  isSelected ? 'bg-[#0e692e] text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                }`}>
                  {adv.name ? adv.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#0e692e]' : 'text-slate-900'}`}>
                      {adv.name}
                    </p>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0e692e] bg-white/90 px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" /> Cotizando
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {adv.role || 'Asesor Comercial'}
                  </p>
                  {adv.phone && (
                    <p className="text-[10px] text-emerald-700 font-medium">
                      {adv.phone}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Datos del Cliente */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            1. Datos del Cliente
          </h3>
          {clients && clients.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
            </span>
          )}
        </div>

        {clients && clients.length > 0 && (
          <div ref={clientSearchRef} className="relative mb-5">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#0e692e]" />
                  Buscador Inteligente de Clientes
                </label>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {clients.length} {clients.length === 1 ? 'cliente' : 'clientes'} • Autocompleta en 1 clic
                </span>
              </div>

              {/* Input con Buscador Interactivo */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-700">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => {
                    setClientSearchQuery(e.target.value);
                    setIsClientSearchOpen(true);
                  }}
                  onFocus={() => setIsClientSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsClientSearchOpen(false);
                    if (e.key === 'Enter' && filteredClients.length > 0) {
                      e.preventDefault();
                      handleSelectClient(filteredClients[0]);
                    }
                  }}
                  placeholder="Escribe nombre, DNI, RUC o WhatsApp para autocompletar..."
                  className="w-full bg-white border border-emerald-300 rounded-lg pl-9 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all shadow-xs"
                />
                {clientSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setClientSearchQuery('');
                      setIsClientSearchOpen(true);
                    }}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    title="Borrar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-emerald-600">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Menú Desplegable Flotante */}
              {isClientSearchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {/* Encabezado del Dropdown */}
                  <div className="px-3 py-2 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      {clientSearchQuery ? (
                        <>
                          <Search className="w-3 h-3 text-[#0e692e]" />
                          Resultados ({filteredClients.length})
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-emerald-700" />
                          Clientes Recientes ({filteredClients.length})
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">Clic o Enter para seleccionar</span>
                  </div>

                  {/* Lista de Resultados */}
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => {
                      const initials = (client.name || 'C')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase();
                      const isSelected = currentClientMatch?.id === client.id || 
                        (proforma.client?.docNumber && client.docNumber && proforma.client.docNumber === client.docNumber);

                      return (
                        <button
                          key={client.id || client.docNumber}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/80 text-emerald-950 font-semibold border-l-4 border-[#0e692e]'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-[#0e692e]/10 text-[#0e692e] flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {client.name}
                              </span>
                              {isSelected && (
                                <span className="bg-[#0e692e] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                                  Seleccionado
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
                              {(client.docNumber || client.dni) && (
                                <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                                  Doc: {client.docNumber || client.dni}
                                </span>
                              )}
                              {client.phone && (
                                <span className="text-emerald-700 font-medium">
                                  Tel: {client.phone}
                                </span>
                              )}
                              {client.city && (
                                <span className="text-slate-400">
                                  • {client.city}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Acción */}
                          <span className="text-[11px] text-[#0e692e] font-semibold opacity-80 shrink-0">
                            Cargar →
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-700 font-medium mb-1">
                        No se encontró ningún cliente con "{clientSearchQuery}".
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Ingresa sus datos en los campos de abajo y el cliente se guardará automáticamente al generar la proforma.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Indicador de Cliente Vinculado */}
              {currentClientMatch && (
                <div className="mt-2.5 flex items-center justify-between bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-emerald-900 shadow-2xs">
                  <div className="flex items-center gap-2 truncate">
                    <UserCheck className="w-4 h-4 text-[#0e692e] shrink-0" />
                    <span className="truncate">
                      Cliente cargado: <strong>{currentClientMatch.name}</strong>
                    </span>
                    {currentClientMatch.docNumber && (
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0">
                        Doc: {currentClientMatch.docNumber}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...proforma,
                        client: {
                          ...proforma.client,
                          name: '',
                          docNumber: '',
                          email: '',
                          phone: ''
                        }
                      });
                    }}
                    className="text-[11px] font-medium text-slate-500 hover:text-red-600 transition-colors shrink-0 ml-2"
                    title="Limpiar datos de cliente"
                  >
                    Desvincular
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Cliente o Empresa
            </label>
            <input
              type="text"
              list="clients-autocomplete-list"
              value={proforma.client?.name || ''}
              onChange={(e) => handleClientNameChange(e.target.value)}
              onBlur={(e) => {
                if (e.target.value) {
                  handleClientChange('name', normalizeName(e.target.value));
                }
              }}
              placeholder="Inversiones Andinas S.A.C."
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-medium"
            />
            <datalist id="clients-autocomplete-list">
              {clients.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.docNumber ? `Doc: ${c.docNumber} ` : ''}{c.phone ? `• ${c.phone}` : ''}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              RUC / DNI / ID Fiscal
            </label>
            <input
              type="text"
              value={proforma.client?.docNumber || ''}
              onChange={(e) => handleDocNumberChange(e.target.value)}
              placeholder="20601234567"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-medium font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={proforma.client?.email || ''}
              onChange={(e) => handleClientChange('email', e.target.value)}
              placeholder="contacto@andinas.pe"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Validez de Oferta
            </label>
            <input
              type="text"
              value={proforma.client?.validDays || '7 días hábiles'}
              onChange={(e) => handleClientChange('validDays', e.target.value)}
              placeholder="7 días hábiles"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Teléfono WhatsApp del Cliente (para envío directo)
            </label>
            <input
              type="text"
              value={proforma.client?.phone || ''}
              onChange={(e) => handleClientPhoneChange(e.target.value)}
              onBlur={(e) => {
                if (e.target.value) {
                  handleClientPhoneChange(e.target.value);
                }
              }}
              placeholder="+51 987 654 321"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Conceptos y Servicios */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          2. Conceptos y Servicios
        </h3>

        <div className="space-y-3">
          {/* Conceptos / Ítems */}
          {(proforma.items || []).map((item, idx) => (
            <div 
              key={item.id || idx} 
              className={`p-4 rounded-2xl border transition-all ${
                showCustomAmounts 
                  ? 'bg-emerald-50/40 border-emerald-300/80 shadow-xs' 
                  : 'bg-[#F8FAFC] border-slate-200/80'
              }`}
            >
              {/* Fila 1: Descripción Completa (Ocupa Toda la Fila) */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Descripción del Concepto / Parcela
                  </label>
                  {proforma.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Eliminar este concepto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  placeholder="Ej: Parcela Agrícola - Palta Hass (1,000 m²)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all"
                />
              </div>

              {/* Fila 2: Cantidad, Precio Unitario e Importe Total */}
              <div className="grid grid-cols-12 gap-2.5 items-end">
                {/* Cantidad */}
                <div className="col-span-3">
                  <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center sm:text-left">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full h-[38px] bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-center font-bold text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                  />
                </div>

                {/* Precio Unitario */}
                <div className="col-span-5">
                  <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-right">
                    Precio Unit.
                  </label>
                  {showCustomAmounts ? (
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full h-[38px] bg-white border-2 border-[#0e692e] rounded-xl px-2.5 py-2 text-xs text-right font-extrabold text-[#0e692e] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0e692e]/30"
                    />
                  ) : (
                    <div 
                      onClick={() => setShowCustomAmounts(true)}
                      className="w-full h-[38px] bg-slate-100 hover:bg-slate-200/60 border border-slate-200 hover:border-slate-300 rounded-xl px-3 text-xs text-right font-bold text-slate-700 select-none cursor-pointer whitespace-nowrap tabular-nums flex items-center justify-end transition-colors shadow-2xs"
                      title="Precio estándar de la plantilla. Haz clic para personalizar."
                    >
                      {formatCurrency(item.unitPrice, proforma.currency).replace('.00', '')}
                    </div>
                  )}
                </div>

                {/* Importe Total */}
                <div className="col-span-4">
                  <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-right">
                    Total
                  </label>
                  <div className="w-full h-[38px] bg-white border border-slate-200/80 rounded-xl px-3 text-xs text-right font-extrabold text-slate-900 tabular-nums whitespace-nowrap flex items-center justify-end shadow-2xs">
                    {formatCurrency(item.total, proforma.currency)}
                  </div>
                </div>
              </div>

              {/* INTERRUPTOR FUSIONADO: PERSONALIZAR MONTOS */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showCustomAmounts}
                    onClick={() => setShowCustomAmounts(!showCustomAmounts)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showCustomAmounts ? 'bg-[#0e692e]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        showCustomAmounts ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span 
                    onClick={() => setShowCustomAmounts(!showCustomAmounts)}
                    className="text-xs font-semibold text-slate-700 cursor-pointer select-none flex items-center gap-1.5"
                  >
                    <span>Personalizar montos (Precio, Inicial y Cuotas)</span>
                    {showCustomAmounts ? (
                      <span className="text-[10.5px] text-[#0e692e] font-bold bg-[#eef7f2] px-2 py-0.5 rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-slate-400 font-normal">
                        (Inactivo - Usa valores estándar)
                      </span>
                    )}
                  </span>
                </div>

                {showCustomAmounts && (
                  <button
                    type="button"
                    onClick={resetToStandard}
                    className="text-[11px] text-slate-500 hover:text-[#0e692e] font-medium flex items-center gap-1 underline cursor-pointer"
                    title="Restablecer valores oficiales de la plantilla"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer estándar</span>
                  </button>
                )}
              </div>

              {/* PANEL FUSIONADO DE PERSONALIZACIÓN DE MONTOS (SOLO VISIBLE SI EL INTERRUPTOR ESTÁ ACTIVO) */}
              {showCustomAmounts && (
                <div className="mt-3.5 pt-3.5 border-t border-emerald-200/70 space-y-3.5 animate-in fade-in duration-150">
                  {/* Resumen de Cuotas Destacado */}
                  {paymentType === 'financiado' ? (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
                        <span className="text-[9.5px] font-semibold text-slate-400 block uppercase">Precio Total</span>
                        <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(totalAmount, proforma.currency).replace('.00', '')}
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
                        <span className="text-[9.5px] font-semibold text-slate-400 block uppercase">Inicial</span>
                        <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(initialPayment, proforma.currency).replace('.00', '')}
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
                        <span className="text-[9.5px] font-semibold text-slate-400 block uppercase">Saldo a Financiar</span>
                        <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(balance, proforma.currency).replace('.00', '')}
                        </span>
                      </div>
                      <div className="bg-[#eef7f2] border border-[#c7ecd5] rounded-xl p-2 shadow-xs">
                        <span className="text-[9.5px] font-bold text-[#0e692e] block uppercase">
                          {months} Cuotas de:
                        </span>
                        <span className="text-xs font-extrabold text-[#0e692e] tabular-nums">
                          {formatCurrency(monthlyInstallment, proforma.currency)} /mes
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
                        <span className="text-[9.5px] font-semibold text-slate-400 block uppercase">Inversión Contado</span>
                        <span className="text-xs font-extrabold text-[#0e692e] tabular-nums">
                          {formatCurrency(totalAmount, proforma.currency).replace('.00', '')}
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
                        <span className="text-[9.5px] font-semibold text-slate-400 block uppercase">Separación</span>
                        <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(reservation, proforma.currency).replace('.00', '')}
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
                        <span className="text-[9.5px] font-semibold text-slate-400 block uppercase">Saldo al Contado</span>
                        <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(Math.max(0, totalAmount - reservation), proforma.currency).replace('.00', '')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Inputs para Modificar Montos Personalizados */}
                  <div className={`grid grid-cols-1 sm:${paymentType === 'financiado' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                    {/* Precio del Producto */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Precio del Producto / Lote (S/)
                      </label>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        placeholder="60000"
                        className="w-full bg-white border border-[#0e692e] rounded-xl px-3 py-2 text-xs font-extrabold text-[#0e692e] focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20"
                      />
                      <span className="text-[10.5px] text-slate-400 mt-1 block">
                        Modifica el valor del lote
                      </span>
                    </div>

                    {/* Cuota Inicial (si es financiado) */}
                    {paymentType === 'financiado' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cuota Inicial Personalizada (S/)
                        </label>
                        <input
                          type="number"
                          step="500"
                          min="0"
                          max={totalAmount}
                          value={initialPayment}
                          onChange={(e) => updateFinancing({ initialPayment: e.target.value === '' ? 0 : Number(e.target.value) })}
                          placeholder="20000"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                        />
                        <span className="text-[10.5px] text-slate-400 mt-1 block">
                          Saldo rest.: {formatCurrency(balance, proforma.currency).replace('.00', '')}
                        </span>
                      </div>
                    )}

                    {/* Separación de Lote */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Separación de Lote (S/)
                      </label>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={reservation}
                        onChange={(e) => updateFinancing({ reservation: e.target.value === '' ? 0 : Number(e.target.value) })}
                        placeholder="1000"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                      />
                      <span className="text-[10.5px] text-slate-400 mt-1 block">
                        Congela precio y ubicación
                      </span>
                    </div>
                  </div>

                  {/* Plazo en Meses (Solo si es financiado) */}
                  {paymentType === 'financiado' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Plazo de Financiamiento (Número de Meses)
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {[12, 18, 24, 36].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => updateFinancing({ months: m })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              months === m
                                ? 'bg-[#0e692e] text-white border-[#0e692e] shadow-sm font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {m} meses {m === 24 ? '(Estándar)' : ''}
                          </button>
                        ))}

                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-xs text-slate-500">Otro plazo:</span>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={months}
                            onChange={(e) => updateFinancing({ months: e.target.value === '' ? 1 : Math.max(1, Number(e.target.value) || 1) })}
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e]"
                          />
                          <span className="text-xs text-slate-500">meses</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Añadir Ítem Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-[#eef7f2] text-[#0e692e] hover:bg-[#d8eedf] font-medium text-xs px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Añadir Ítem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Switch: Ficha Técnica y Plano (2 Páginas en PDF) */}
      <div className="mb-6 p-4 rounded-xl border border-slate-200/80 bg-[#F8FAFC] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            proforma.includeFloorPlan ? 'bg-[#0e692e] text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Incluir Ficha Técnica
            </h4>
            <p className="text-[11px] text-slate-500">
              Genera un documento de 2 páginas con distribución y amenidades.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFloorPlan}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            proforma.includeFloorPlan ? 'bg-[#0e692e]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              proforma.includeFloorPlan ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3. Condiciones Comerciales y Observaciones */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0e692e]" />
            <h3 className="text-sm font-bold text-slate-900">
              Condiciones Comerciales y Observaciones
            </h3>
          </div>
          <span className="text-[11px] text-[#0e692e] font-semibold bg-[#eef7f2] px-2.5 py-0.5 rounded-full">
            Se muestra en Hoja 2 del PDF
          </span>
        </div>

        <textarea
          rows={3}
          value={proforma.conditions?.notes || ''}
          onChange={(e) => handleConditionsChange('notes', e.target.value)}
          placeholder="Condiciones generadas automáticamente por la plantilla seleccionada..."
          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0e692e]/20 focus:border-[#0e692e] transition-all resize-none leading-relaxed font-normal"
        />
      </div>
    </div>
  );
}
