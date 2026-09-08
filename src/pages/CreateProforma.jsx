import React, { useState } from 'react';
import { ArrowLeft, Download, Send, Eye, Check } from 'lucide-react';
import ProformaForm from '../components/proforma/ProformaForm';
import LivePreviewA4 from '../components/proforma/LivePreviewA4';
import ShareModal from '../components/proforma/ShareModal';
import confetti from 'canvas-confetti';

export default function CreateProforma({
  proforma,
  clients = [],
  templates = [],
  advisors = [],
  onSave,
  onBack,
  properties = [],
  onDownloadPdf
}) {
  const [formData, setFormData] = useState(proforma);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sincronizar formData cuando cambia la proforma seleccionada
  React.useEffect(() => {
    if (proforma && typeof proforma === 'object') {
      setFormData(proforma);
    }
  }, [proforma]);

  // Property vinculada
  const selectedProperty = properties.find(p => p.id === formData.selectedPropertyId) || properties[0];

  const handleSelectProperty = (propertyId) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) {
      setFormData({
        ...formData,
        selectedPropertyId: ''
      });
      return;
    }

    const newItem = {
      id: `item-${Date.now()}`,
      description: prop.description || prop.title,
      quantity: 1,
      unitPrice: prop.basePrice,
      discount: prop.suggestedBonus || 0,
      total: Math.max(0, prop.basePrice - (prop.suggestedBonus || 0))
    };

    const total = Math.max(0, prop.basePrice - (prop.suggestedBonus || 0));
    const initPay = prop.category === 'Palta Hass' ? 20000 : (prop.basePrice >= 80000 ? 45000 : 20000);
    const months = 24;
    const balance = Math.max(0, total - initPay);
    const installment = months > 0 ? balance / months : 0;

    const defaultNotes = prop.category === 'Palta Hass'
      ? "Modalidad: Financiamiento Directo (S/ 60,000).\nSeparación: S/ 1,000.\nInicial: S/ 20,000 en 15 días.\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos."
      : "Modalidad: Financiamiento Directo (S/ 85,000).\nSeparación: S/ 1,000.\nInicial: S/ 45,000 en 15 días.\nSaldo: S/ 40,000 financiado en cuotas directas sin bancos.";

    setFormData({
      ...formData,
      selectedPropertyId: prop.id,
      items: [newItem],
      subtotal: prop.basePrice,
      totalDiscount: prop.suggestedBonus || 0,
      total: total,
      includeFloorPlan: Boolean(prop.planImageUrl),
      conditions: {
        ...formData.conditions,
        paymentType: 'financiado',
        reservation: 1000,
        initialPayment: initPay,
        balance: balance,
        months: months,
        monthlyInstallment: installment,
        notes: defaultNotes
      }
    });
  };

  const handleSaveDraft = async () => {
    const saved = await onSave({ ...formData, status: 'borrador' });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onBack) onBack();
    }, 1000);
    return saved;
  };

  const handleSaveAndSend = async () => {
    const updated = {
      ...formData,
      status: 'enviada'
    };
    setFormData(updated);
    await onSave(updated);

    // Efecto visual de éxito
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignorar si no está disponible en el entorno
    }

    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Bar Header idéntico al mockup */}
      <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Volver + Título + Badge Borrador */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Volver al historial"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h1 className="text-lg font-display font-bold text-slate-900 tracking-tight">
              {formData.id ? `Editar Proforma ${formData.code || ''}` : 'Nueva Proforma'}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
              {formData.status === 'enviada' ? 'Enviada' : 'Borrador'}
            </span>
            {savedSuccess && (
              <span className="text-xs text-[#059669] font-medium flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Guardado
              </span>
            )}
          </div>

          {/* Right: Botones de Acción */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
            >
              Guardar Borrador
            </button>

            <button
              type="button"
              onClick={() => onDownloadPdf(formData)}
              className="border border-[#c7ecd5] bg-[#eef7f2] hover:bg-[#d8eedf] text-[#0e692e] font-medium px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndSend}
              className="bg-[#0e692e] hover:bg-[#0a5224] active:scale-[0.98] text-white font-medium px-5 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Guardar y Enviar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Split Canvas: Formulario a la Izquierda vs Live Preview A4 a la Derecha */}
      <main className="max-w-7xl mx-auto p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Panel Izquierdo: Formulario */}
          <div>
            <ProformaForm
              proforma={formData}
              onChange={setFormData}
              properties={properties}
              clients={clients}
              templates={templates}
              advisors={advisors}
              onSelectProperty={handleSelectProperty}
            />
          </div>

          {/* Panel Derecho: Live Preview A4 */}
          <div className="sticky top-24">
            <LivePreviewA4
              proforma={formData}
              property={selectedProperty}
            />
          </div>
        </div>
      </main>

      {/* Modal de Compartir */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          if (onBack) onBack();
        }}
        proforma={formData}
        onDownloadPdf={onDownloadPdf}
      />
    </div>
  );
}
