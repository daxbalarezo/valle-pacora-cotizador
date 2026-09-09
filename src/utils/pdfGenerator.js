import React from 'react';
import { pdf } from '@react-pdf/renderer';
import ExecutivePDFDocument from '../components/pdf/ExecutivePDFDocument';
import { storageService } from '../services/storageService';

export async function generateProformaPdfBlob(proforma) {
  const properties = storageService.getProperties();
  const property = properties.find(p => p.id === proforma.selectedPropertyId) || properties[0];
  const element = React.createElement(ExecutivePDFDocument, { proforma, property });
  return await pdf(element).toBlob();
}

export async function downloadProformaPdf(proforma) {
  try {
    console.log('[PDF] Generando proforma ejecutiva con logotipo oficial Valle Pacora:', proforma?.code);
    const blob = await generateProformaPdfBlob(proforma);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    link.download = `Proforma-${(proforma.code || 'VallePacora').replace('#', '')}-${timeStr}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error al compilar el PDF: ' + error.message);
    return false;
  }
}
