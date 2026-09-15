import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image 
} from '@react-pdf/renderer';
import { COMPANY_INFO } from '../../services/storageService';
import { MEMBRETE_OFICIAL_BG } from '../../assets/membreteBase64';
import { LOGO_VALLE_PACORA } from '../../assets/logoBase64';
import { PALTA_HASS_IMAGE, ARANDANO_IMAGE } from '../../assets/cropImagesBase64';
import { getPaltaProjection, getArandanoProjection } from '../../utils/profitabilityCalc';

const styles = StyleSheet.create({
  page: {
    paddingTop: 82,
    paddingBottom: 86,
    paddingHorizontal: 30,
    fontFamily: 'Helvetica',
    color: '#0F172A',
    fontSize: 9,
    lineHeight: 1.35,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerLogoImage: {
    height: 32,
    width: 59,
    objectFit: 'contain',
  },
  p2LogoImage: {
    height: 26,
    width: 48,
    objectFit: 'contain',
  },

  contentBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#0e692e',
    marginBottom: 10,
  },
  companyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  companyDetail: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 1.5,
  },
  quoteMetaBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  quoteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  quoteTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  quoteCodeBadge: {
    backgroundColor: '#EEF7F2',
    borderWidth: 0.8,
    borderColor: '#C7ECD5',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  quoteCodeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0e692e',
  },
  quoteCode: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0e692e',
  },
  quoteDate: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 2,
  },

  // 2 Columns: Client vs Advisor
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clientCard: {
    width: '48%',
  },
  advisorCard: {
    width: '48%',
  },
  cardHeader: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0e692e',
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  clientTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    lineHeight: 1.2,
  },
  clientDoc: {
    fontSize: 8,
    color: '#475569',
    marginTop: 1.5,
  },
  clientSub: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 1,
  },
  advisorTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    lineHeight: 1.2,
  },
  advisorRole: {
    fontSize: 8,
    color: '#475569',
    marginTop: 1.5,
  },
  advisorSub: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 1,
  },

  // Table
  tableContainer: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
  },
  th1: { width: '52%', fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', textTransform: 'uppercase' },
  th2: { width: '14%', fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', textAlign: 'center', textTransform: 'uppercase' },
  th3: { width: '17%', fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', textAlign: 'right', textTransform: 'uppercase' },
  th4: { width: '17%', fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', textAlign: 'right', textTransform: 'uppercase' },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  td1: { width: '52%', fontSize: 8, color: '#1E293B', fontFamily: 'Helvetica' },
  td2: { width: '14%', fontSize: 8, color: '#475569', textAlign: 'center' },
  td3: { width: '17%', fontSize: 8, color: '#475569', textAlign: 'right' },
  td4: { width: '17%', fontSize: 8, color: '#0F172A', fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // Summary & Totals
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  conditionsBox: {
    width: '58%',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  conditionsTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0e692e',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  conditionsMain: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 3,
  },
  conditionsText: {
    fontSize: 7.5,
    color: '#475569',
    lineHeight: 1.35,
  },
  totalsBox: {
    width: '39%',
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 7.5,
    color: '#64748B',
  },
  totalVal: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
  },
  bonusVal: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#047857',
  },
  finalInvestmentBox: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#0e692e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  finalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0e692e',
  },

  // Bank Info
  bankInfoContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  bankHeader: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankItem: {
    width: '32%',
  },
  bankTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 1,
  },
  bankText: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#334155',
    marginTop: 1,
  },

  // Signatures Section (Firma Única Gerente General)
  signatureSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 8,
    marginBottom: 2,
  },
  signCol: {
    width: 230,
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  signTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signRole: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0e692e',
    marginTop: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signCompany: {
    fontSize: 6.5,
    color: '#64748B',
    marginTop: 1,
    textAlign: 'center',
  },

  // Page 2: Technical Sheet
  p2Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#0e692e',
    marginBottom: 10,
  },
  p2Subtitle: {
    fontSize: 7,
    color: '#0e692e',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  p2Title: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginTop: 2,
  },
  techSpecsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  specCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specTitle: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  specVal: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginTop: 2,
  },
  planImageBox: {
    width: '100%',
    height: 145,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  planImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  p2ConditionsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  p2ConditionsTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0e692e',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  p2ConditionsItem: {
    fontSize: 7,
    color: '#334155',
    lineHeight: 1.35,
    fontFamily: 'Helvetica',
  },
  amenitiesContainer: {
    marginBottom: 6,
  },
  amenitiesTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 3,
  },
  amenityBadge: {
    width: '49%',
    backgroundColor: '#F8FAFC',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 6.5,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profTableContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#166534',
    borderRadius: 6,
    overflow: 'hidden',
  },
  profHeader: {
    flexDirection: 'row',
    backgroundColor: '#166534',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  profTh: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  profRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  profRowTotal: {
    backgroundColor: '#f0fdf4',
    borderTopWidth: 1.5,
    borderTopColor: '#166534',
  },
  profTdYear: {
    width: '15%',
    fontSize: 7.5,
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
  },
  profTdProd: {
    width: '37%',
    fontSize: 7.5,
    color: '#475569',
  },
  profTdNum: {
    width: '16%',
    fontSize: 7.5,
    textAlign: 'right',
    color: '#475569',
  },
  profTdProfit: {
    width: '16%',
    fontSize: 7.5,
    textAlign: 'right',
    color: '#166534',
    fontFamily: 'Helvetica-Bold',
  }
});

const formatMoney = (val, currency = 'PEN') => {
  const num = Number(val) || 0;
  const str = num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === 'USD' ? `$ ${str}` : `S/ ${str}`;
};

export default function ExecutivePDFDocument({ proforma = {}, property = {} }) {
  const currency = proforma.currency || 'PEN';
  const displayDate = proforma.formattedDate || '07 set. 2026';
  const hasFloorPlan = proforma.includeFloorPlan !== false;

  const clientName = proforma.client?.name || 'Cliente Registrado';
  const clientDoc = proforma.client?.docNumber ? `${proforma.client.docType || 'DNI'}: ${proforma.client.docNumber}` : 'DNI: -';
  const clientPhone = proforma.client?.phone || '';
  const clientEmail = proforma.client?.email || '';

  const advisorName = proforma.advisorName || 'Daniel Balarezo';
  const advisorRole = proforma.advisorRole || 'Asesor Comercial Especializado';
  const advisorPhone = proforma.advisorPhone || '+51 987 654 321';

  // Variables de Financiamiento y Matemática de Cuotas
  const totalAmount = Number(proforma.total) || 60000;
  const conditions = proforma.conditions || {};
  const paymentType = conditions.paymentType || 'financiado';
  const defaultInitial = totalAmount >= 80000 ? 45000 : 20000;
  const initialPayment = conditions.initialPayment !== undefined ? Number(conditions.initialPayment) : defaultInitial;
  const reservation = conditions.reservation !== undefined ? Number(conditions.reservation) : 1000;
  const months = conditions.months !== undefined ? Number(conditions.months) : 24;
  const hasHarvestBonus = conditions.hasHarvestBonus || false;
  const balance = Math.max(0, totalAmount - initialPayment - (hasHarvestBonus ? 10000 : 0));
  const monthlyInstallment = months > 0 ? balance / months : 0;

  const isArandano = Boolean(
    (property?.cropType && (property.cropType.toLowerCase().includes('arándano') || property.cropType.toLowerCase().includes('arandano'))) ||
    (property?.category && (property.category.toLowerCase().includes('arándano') || property.category.toLowerCase().includes('arandano'))) ||
    (property?.title && (property.title.toLowerCase().includes('arándano') || property.title.toLowerCase().includes('arandano'))) ||
    (proforma?.selectedPropertyId && proforma.selectedPropertyId.includes('arandano')) ||
    (proforma?.items && proforma.items.some(it => (it.description || '').toLowerCase().includes('arándano') || (it.description || '').toLowerCase().includes('arandano')))
  );

  const cropImageSrc = isArandano ? ARANDANO_IMAGE : PALTA_HASS_IMAGE;
  const cropName = isArandano ? "Arándanos" : "Palta Hass";
  const cropTitle = isArandano ? "Parcela Agrícola - Arándanos" : "Parcela Agrícola - Palta Hass";

  const quantity = proforma.items?.[0]?.quantity || 1;
  const profData = isArandano ? getArandanoProjection(quantity) : getPaltaProjection(quantity);

  return (
    <Document
      title={`Proforma-${proforma.code || 'Cotizacion'}`}
      author={COMPANY_INFO.name}
      subject="Cotización Oficial Inmobiliaria"
    >
      {/* PÁGINA 1: PROPUESTA ECONÓMICA Y COMERCIAL (ISO A4 210 x 297 mm) */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Fondo de Membrete Oficial Valle Pacora */}
        <Image src={MEMBRETE_OFICIAL_BG} style={styles.backgroundImage} fixed />

        <View style={styles.contentBody} wrap={false}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.companyBox}>
              <Image src={LOGO_VALLE_PACORA} style={styles.headerLogoImage} />
              <View>
                <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
                <Text style={styles.companyDetail}>RUC: {COMPANY_INFO.ruc}</Text>
              </View>
            </View>
            <View style={styles.quoteMetaBox}>
              <View style={styles.quoteTitleRow}>
                <Text style={styles.quoteTitle}>COTIZACIÓN</Text>
                <View style={styles.quoteCodeBadge}>
                  <Text style={styles.quoteCodeText}>{proforma.code || '#COT-1001'}</Text>
                </View>
              </View>
              <Text style={styles.quoteDate}>Fecha de emisión: {displayDate}</Text>
            </View>
          </View>

          {/* Bloque Cliente & Asesor */}
          <View style={styles.infoCardsContainer}>
            <View style={styles.clientCard}>
              <Text style={styles.cardHeader}>Preparado Para:</Text>
              <Text style={styles.clientTitle}>{clientName}</Text>
              <Text style={styles.clientDoc}>{clientDoc}</Text>
              {clientEmail ? (
                <Text style={styles.clientSub}>Email: {clientEmail}</Text>
              ) : null}
              {clientPhone ? (
                <Text style={styles.clientSub}>Tel: {clientPhone}</Text>
              ) : null}
            </View>

            <View style={styles.advisorCard}>
              <Text style={styles.cardHeader}>Asesor Comercial Responsable:</Text>
              <Text style={styles.advisorTitle}>{advisorName}</Text>
              <Text style={styles.advisorRole}>{advisorRole}</Text>
              <Text style={styles.advisorSub}>Tel: {advisorPhone}</Text>
            </View>
          </View>

          {/* Tabla de Conceptos y Servicios */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.th1}>CONCEPTO / PARCELA AGRÍCOLA</Text>
              <Text style={styles.th2}>CANT.</Text>
              <Text style={styles.th3}>PRECIO UNIT.</Text>
              <Text style={styles.th4}>IMPORTE</Text>
            </View>

            {(proforma.items && proforma.items.length > 0 ? proforma.items : [
              { description: property?.title || 'Parcela Agrícola Valle Pacora', quantity: 1, unitPrice: proforma.total || 60000, total: proforma.total || 60000 }
            ]).map((item, idx) => (
              <View key={item.id || idx} style={styles.tableRow}>
                <Text style={styles.td1}>{item.description || 'Parcela Agrícola Valle Pacora'}</Text>
                <Text style={styles.td2}>{item.quantity || 1}</Text>
                <Text style={styles.td3}>{formatMoney(item.unitPrice, currency)}</Text>
                <Text style={styles.td4}>{formatMoney(item.total, currency)}</Text>
              </View>
            ))}
          </View>

          {/* Resumen Financiero y Condiciones Comerciales */}
          <View style={styles.bottomContainer}>
            <View style={styles.conditionsBox}>
              <Text style={styles.conditionsTitle}>Modalidad de Pago:</Text>
              <Text style={styles.conditionsMain}>
                {paymentType === 'contado' ? 'Pago al Contado con Descuento Inmediato' : `Financiamiento Directo (${months} Cuotas)`}
              </Text>
              <Text style={styles.conditionsText}>
                {paymentType === 'contado'
                  ? `Separación: ${formatMoney(reservation, currency)}\nSaldo restante se completara en 7 dias calendario.`
                  : `Pago Inicial: ${formatMoney(initialPayment, currency)} (financiamiento directo sin bancos).\n${proforma.conditions?.hasHarvestBonus ? `Pago en Cosecha: S/ 10,000 en 3er año.` : ''}`}
              </Text>
            </View>

            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Precio Total:</Text>
                <Text style={styles.totalVal}>{formatMoney(proforma.total, currency)}</Text>
              </View>

              {proforma.totalDiscount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Descuento:</Text>
                  <Text style={styles.bonusVal}>-{formatMoney(proforma.totalDiscount, currency)}</Text>
                </View>
              )}

              {paymentType === 'financiado' && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Pago Inicial:</Text>
                  <Text style={styles.totalVal}>-{formatMoney(initialPayment, currency)}</Text>
                </View>
              )}

              {paymentType === 'financiado' && proforma.conditions?.hasHarvestBonus && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Pago en Cosecha:</Text>
                  <Text style={styles.totalVal}>-{formatMoney(10000, currency)}</Text>
                </View>
              )}

              {paymentType === 'financiado' && (
                <View style={{ borderTopWidth: 2, borderTopColor: '#0e692e', paddingTop: 6, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#475569' }}>SALDO A FINANCIAR:</Text>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e293b' }}>{formatMoney(balance, currency)}</Text>
                  </View>
                  <View style={{ backgroundColor: '#EEF7F2', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0e692e' }}>{months} CUOTAS DE:</Text>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Helvetica-Bold', color: '#0e692e' }}>{formatMoney(monthlyInstallment, currency)}</Text>
                  </View>
                </View>
              )}

              {paymentType === 'contado' && (
                <View style={styles.finalInvestmentBox}>
                  <Text style={styles.finalLabel}>INVERSIÓN TOTAL:</Text>
                  <Text style={styles.finalValue}>{formatMoney(Math.max(0, proforma.total - proforma.totalDiscount), currency)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Cuentas Bancarias Recaudadoras */}
          <View style={styles.bankInfoContainer}>
            <Text style={styles.bankHeader}>Cuentas Corrientes Oficiales Recaudadoras ({COMPANY_INFO.name}):</Text>
            <View style={styles.bankRow}>
              <View style={styles.bankItem}>
                <Text style={styles.bankTitle}>BCP (Soles):</Text>
                <Text style={styles.bankText}>Cta: 3057063526053</Text>
                <Text style={styles.bankText}>CCI: 00230500706352605315</Text>
              </View>
              <View style={styles.bankItem}>
                <Text style={styles.bankTitle}>BBVA (Soles):</Text>
                <Text style={styles.bankText}>Cta: 001103480200403552</Text>
                <Text style={styles.bankText}>CCI: 01134800020040355209</Text>
              </View>
              <View style={styles.bankItem}>
                <Text style={styles.bankTitle}>BBVA (Dólares):</Text>
                <Text style={styles.bankText}>Cta: 001103480200438836</Text>
                <Text style={styles.bankText}>CCI: 01134800020043883605</Text>
              </View>
            </View>
          </View>

          {/* Firma Única Oficial: Gerente General */}
          <View style={styles.signatureSection}>
            <View style={styles.signCol}>
              <Text style={styles.signTitle}>ELMER DIONI GARCIA FERNANDEZ</Text>
              <Text style={styles.signRole}>GERENTE GENERAL</Text>
              <Text style={styles.signCompany}>{COMPANY_INFO.name}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PÁGINA 2: ANEXO TÉCNICO Y PLANO CATASTRAL (ISO A4 210 x 297 mm) */}
      {hasFloorPlan && (
        <Page size="A4" orientation="portrait" style={styles.page}>
          {/* Fondo de Membrete Oficial Valle Pacora */}
          <Image src={MEMBRETE_OFICIAL_BG} style={styles.backgroundImage} fixed />
          <View style={styles.contentBody} wrap={false}>
            {/* Header Página 2 */}
            <View style={styles.p2Header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image src={LOGO_VALLE_PACORA} style={styles.p2LogoImage} />
                <View>
                  <Text style={styles.p2Subtitle}>ANEXO TÉCNICO Y FICHA AGRÍCOLA</Text>
                  <Text style={styles.p2Title}>
                    {property?.title || cropTitle}
                  </Text>
                </View>
              </View>
              <View style={styles.quoteMetaBox}>
                <Text style={styles.quoteCode}>{proforma.code || '#COT-1001'}</Text>
                <Text style={styles.quoteDate}>Anexo Técnico</Text>
              </View>
            </View>

            {/* Cuadro de Especificaciones de Áreas y Cultivo */}
            <View style={styles.techSpecsGrid}>
              <View style={styles.specCard}>
                <Text style={styles.specTitle}>Área Total</Text>
                <Text style={styles.specVal}>{property?.area ? `${property.area} m²` : '1,000 m²'}</Text>
              </View>
              <View style={styles.specCard}>
                <Text style={styles.specTitle}>Cultivo Apto</Text>
                <Text style={styles.specVal}>{property?.cropType || property?.category || cropName}</Text>
              </View>
              <View style={styles.specCard}>
                <Text style={styles.specTitle}>Sistema de Riego</Text>
                <Text style={styles.specVal}>{property?.waterAccess ? 'Punto Presurizado' : 'Riego por Goteo'}</Text>
              </View>
            </View>

            {/* Tabla de Rentabilidad Proyectada */}
            <View style={styles.profTableContainer}>
              <View style={styles.profHeader}>
                <Text style={[styles.profTh, { width: '15%' }]}>Año</Text>
                <Text style={[styles.profTh, { width: '37%' }]}>Cosecha (kg)</Text>
                <Text style={[styles.profTh, { width: '16%', textAlign: 'right' }]}>Ingreso Bruto</Text>
                <Text style={[styles.profTh, { width: '16%', textAlign: 'right' }]}>Costos</Text>
                <Text style={[styles.profTh, { width: '16%', textAlign: 'right' }]}>Utilidad Neta</Text>
              </View>

              {profData.rows.map((row, idx) => (
                <View key={idx} style={[styles.profRow, idx % 2 !== 0 && { backgroundColor: '#f8fafc' }]}>
                  <Text style={styles.profTdYear}>
                    {row.period} 
                    {row.badge && `\n(${row.badge})`}
                  </Text>
                  
                  {row.isInvestment && (
                    <Text style={[styles.profTdProd, { width: '85%', color: '#64748B', fontStyle: 'italic' }]}>
                      {row.label}
                    </Text>
                  )}
                  
                  {!row.isInvestment && <Text style={styles.profTdProd}>{row.production}</Text>}
                  {!row.isInvestment && <Text style={styles.profTdNum}>{formatMoney(row.revenue, currency)}</Text>}
                  {!row.isInvestment && <Text style={styles.profTdNum}>{formatMoney(row.costs, currency)}</Text>}
                  {!row.isInvestment && <Text style={styles.profTdProfit}>{formatMoney(row.profit, currency)}</Text>}
                </View>
              ))}

              {/* Fila de Total */}
              <View style={[styles.profRow, styles.profRowTotal]}>
                <Text style={[styles.profTdYear, { color: '#166534' }]}>TOTAL ({profData.totalYears} años)</Text>
                <Text style={styles.profTdProd}>--</Text>
                <Text style={[styles.profTdNum, { color: '#166534', fontFamily: 'Helvetica-Bold' }]}>{formatMoney(profData.totalRevenue, currency)}</Text>
                <Text style={styles.profTdNum}>--</Text>
                <Text style={[styles.profTdProfit, { fontSize: 8 }]}>{formatMoney(profData.totalProfit, currency)}</Text>
              </View>
            </View>

            {/* Cuadro de Beneficios Agronómicos y Legales */}
            <View style={[styles.amenitiesContainer, { marginTop: 8 }]}>
              <Text style={styles.amenitiesTitle}>Especificaciones Agronómicas y Garantías Legales:</Text>
              <View style={styles.amenitiesGrid}>
                {(property?.amenities || [
                  "Acceso carrozable directo e independiente",
                  "Puntos de riego tecnificado por goteo a pie de lote",
                  "Título de propiedad independizado en SUNARP",
                  "Factibilidad de energía eléctrica y servicios",
                  "Alta plusvalía garantizada por corredor agroindustrial",
                  "Suelo agrícola de primera calidad y clima óptimo"
                ])
                .filter(item => !item.toLowerCase().includes('financiado') && !item.toLowerCase().includes('contado'))
                .map((item, idx) => (
                  <Text key={idx} style={styles.amenityBadge}>
                    • {item.replace(/Palta Hass/gi, cropName)}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
}
