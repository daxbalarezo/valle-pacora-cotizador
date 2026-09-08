/**
 * Semilla Oficial de Base de Datos - Valle Pacora / Roble Constructora del Peru SAC
 * Contiene únicamente las 2 parcelas agrícolas autorizadas (Palta Hass y Arándanos),
 * las proformas vigentes, el directorio de clientes y la configuración legal/bancaria.
 */

export const SEED_PROPERTIES = [
  {
    id: "parcela-palta-1000",
    title: "Parcela Agrícola - Palta Hass (1,000 m²)",
    category: "Palta Hass",
    cropType: "Palta Hass",
    area: 1000,
    rooms: 0,
    baths: 0,
    basePrice: 60000.00, // Financiado
    cashPrice: 57000.00, // Contado
    initialPayment: 20000.00,
    reservationFee: 1000.00,
    financedBalance: 40000.00,
    suggestedBonus: 0,
    description: "Parcela Agrícola Valle Pacora - Proyecto Palta Hass. Al contado S/ 57,000 o financiado S/ 60,000 (Inicial S/ 20,000, separación S/ 1,000).",
    planImageUrl: "https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80",
    waterAccess: "Puntos de riego presurizado por goteo",
    amenities: [
      "Puntos de riego presurizado por goteo",
      "Título de propiedad independizado en Sunarp",
      "Suelo con pH óptimo para cultivo de Palta Hass",
      "Al Contado: S/ 57,000.00",
      "Financiado: S/ 60,000.00 (Separación S/ 1,000 + Inicial S/ 20,000)"
    ],
    details: {
      etapa: "Segunda Etapa",
      cultivo: "Palta Hass (Variedad de exportación)",
      precioContado: "S/ 57,000.00",
      precioFinanciado: "S/ 60,000.00",
      inicial: "S/ 20,000.00",
      separacion: "S/ 1,000.00",
      saldoFinanciado: "S/ 40,000.00 (en cuotas directas)",
      zonificacion: "Agrícola Productiva"
    }
  },
  {
    id: "parcela-arandano-1000",
    title: "Parcela Agrícola - Arándanos (1,000 m²)",
    category: "Arándanos",
    cropType: "Arándanos",
    area: 1000,
    rooms: 0,
    baths: 0,
    basePrice: 85000.00, // Financiado
    cashPrice: 60000.00, // Contado
    initialPayment: 45000.00,
    reservationFee: 1000.00,
    financedBalance: 40000.00,
    suggestedBonus: 0,
    description: "Parcela Agrícola Valle Pacora - Proyecto Arándanos. Al contado S/ 60,000 o financiado S/ 85,000 (Inicial S/ 45,000, separación S/ 1,000).",
    planImageUrl: "https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?auto=format&fit=crop&w=1200&q=80",
    waterAccess: "Sistema de riego presurizado automatizado",
    amenities: [
      "Sistema de riego presurizado de alta precisión",
      "Título independizado listo para registro en Sunarp",
      "Camellones y sustrato preparado para Arándanos",
      "Al Contado: S/ 60,000.00",
      "Financiado: S/ 85,000.00 (Separación S/ 1,000 + Inicial S/ 45,000)"
    ],
    details: {
      etapa: "Segunda Etapa",
      cultivo: "Arándanos (Variedad de alta densidad)",
      precioContado: "S/ 60,000.00",
      precioFinanciado: "S/ 85,000.00",
      inicial: "S/ 45,000.00",
      separacion: "S/ 1,000.00",
      saldoFinanciado: "S/ 40,000.00 (en cuotas directas)",
      zonificacion: "Agrícola Productiva"
    }
  }
];

export const SEED_PROFORMAS = [];

export const SEED_CLIENTS = [];

export const SEED_TEMPLATES = [
  {
    id: "tpl-palta-contado",
    title: "Palta Hass - Pago al Contado (S/ 57,000)",
    crop: "palta",
    category: "Palta Hass",
    area: 1000,
    unitPrice: 57000.00,
    currency: "PEN",
    description: "Parcela Agrícola Palta Hass 1,000 m² con precio especial al contado de S/ 57,000",
    propertyId: "parcela-palta-1000",
    quantity: 1,
    conditions: "Modalidad: Pago al Contado.\nPrecio total: S/ 57,000.00.\nSeparación: S/ 1,000.00 para congelar precio y ubicación.\nSaldo de S/ 56,000.00 contra firma de minuta notarial.\nValidez de la proforma: 7 días calendarios.",
    includeFloorPlan: true,
    tag: "Contado Especial",
    isPopular: true
  },
  {
    id: "tpl-palta-financiado",
    title: "Palta Hass - Financiado (S/ 60,000)",
    crop: "palta",
    category: "Palta Hass",
    area: 1000,
    unitPrice: 60000.00,
    currency: "PEN",
    description: "Parcela Agrícola Palta Hass 1,000 m² financiada (Inicial S/ 20k, separación S/ 1k, saldo financiado)",
    propertyId: "parcela-palta-1000",
    quantity: 1,
    conditions: "Modalidad: Financiamiento Directo.\nPrecio total: S/ 60,000.00.\nSeparación: S/ 1,000.00.\nCuota Inicial: S/ 20,000.00 (a completar en 15 días).\nSaldo a financiar: S/ 40,000.00 en cuotas fijas con la constructora.\nValidez de la proforma: 7 días calendarios.",
    includeFloorPlan: true,
    tag: "Más Cotizado",
    isPopular: true
  },
  {
    id: "tpl-arandano-contado",
    title: "Arándanos - Pago al Contado (S/ 60,000)",
    crop: "arandano",
    category: "Arándanos",
    area: 1000,
    unitPrice: 60000.00,
    currency: "PEN",
    description: "Parcela Agrícola Arándanos 1,000 m² con precio de oportunidad al contado de S/ 60,000",
    propertyId: "parcela-arandano-1000",
    quantity: 1,
    conditions: "Modalidad: Pago al Contado.\nPrecio total: S/ 60,000.00.\nSeparación: S/ 1,000.00 para congelar precio y ubicación.\nSaldo de S/ 59,000.00 contra firma de minuta notarial.\nValidez de la proforma: 7 días calendarios.",
    includeFloorPlan: true,
    tag: "Contado Oportunidad",
    isPopular: true
  },
  {
    id: "tpl-arandano-financiado",
    title: "Arándanos - Financiado (S/ 85,000)",
    crop: "arandano",
    category: "Arándanos",
    area: 1000,
    unitPrice: 85000.00,
    currency: "PEN",
    description: "Parcela Agrícola Arándanos 1,000 m² financiada (Inicial S/ 45k, separación S/ 1k, saldo financiado)",
    propertyId: "parcela-arandano-1000",
    quantity: 1,
    conditions: "Modalidad: Financiamiento Directo.\nPrecio total: S/ 85,000.00.\nSeparación: S/ 1,000.00.\nCuota Inicial: S/ 45,000.00 (a completar en 15 días).\nSaldo a financiar: S/ 40,000.00 en cuotas fijas con la constructora.\nValidez de la proforma: 7 días calendarios.",
    includeFloorPlan: true,
    tag: "Alta Rentabilidad",
    isPopular: true
  }
];

export const SEED_CONFIG = {
  company: {
    name: "Roble Constructora del Peru SAC",
    brandName: "Valle Pacora",
    ruc: "20611738022",
    address: "Av. Victor Raul Haya de la Torre N° 127 Piso 2",
    city: "Chiclayo, Lambayeque, Perú",
    phone: "+51 974 882 104",
    email: "ventas@robleconstructora.pe",
    website: "https://vallepacora.pe"
  },
  bankAccounts: [
    {
      id: "bank-bcp",
      bank: "Banco de Crédito del Perú (BCP)",
      currency: "Soles (PEN)",
      accountType: "Cuenta Corriente",
      accountNumber: "305-98451230-0-18",
      cci: "002-305-009845123018-12",
      holder: "Roble Constructora del Peru SAC"
    },
    {
      id: "bank-bbva",
      bank: "BBVA Continental",
      currency: "Soles (PEN)",
      accountType: "Cuenta Corriente",
      accountNumber: "0011-0284-0100054892",
      cci: "011-284-000100054892-34",
      holder: "Roble Constructora del Peru SAC"
    }
  ],
  commercialDefaults: {
    currency: "PEN",
    validDays: 7,
    separationAmount: 1000,
    defaultNotes: "Forma de pago: S/ 1,000 de separación y cuota inicial completada en máximo 15 días.\nTiempo de validez de la proforma 7 días calendarios.\nEntrega de puntos de riego presurizado y título independizado en Sunarp."
  },
export const SEED_ADVISORS = [
  {
    id: "advisor-1",
    name: "Daniel Balarezo",
    role: "Asesor Comercial Especializado",
    phone: "+51 987 654 321",
    email: "daniel.balarezo@vallepacora.pe",
    isDefault: true,
    active: true,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z"
  }
];

export const SEED_CONFIG = {
  company: {
    name: "Roble Constructora del Peru SAC",
    brandName: "Valle Pacora",
    ruc: "20611738022",
    address: "Av. Victor Raul Haya de la Torre N° 127 Piso 2",
    city: "Chiclayo, Perú",
    phone: "+51 974 882 104",
    email: "ventas@robleconstructora.pe",
    website: "www.vallepacora.pe"
  },
  bankAccounts: [
    {
      id: "bank-bcp",
      bank: "Banco de Crédito del Perú (BCP)",
      currency: "Soles (PEN)",
      accountType: "Cuenta Corriente",
      accountNumber: "3057063526053",
      cci: "00230500706352605315",
      holder: "Roble Constructora del Peru SAC"
    },
    {
      id: "bank-bbva-pen",
      bank: "BBVA Continental",
      currency: "Soles (PEN)",
      accountType: "Cuenta Corriente",
      accountNumber: "001103480200403552",
      cci: "01134800020040355209",
      holder: "Roble Constructora del Peru SAC"
    },
    {
      id: "bank-bbva-usd",
      bank: "BBVA Continental",
      currency: "Dólares (USD)",
      accountType: "Cuenta Corriente",
      accountNumber: "001103480200438836",
      cci: "01134800020043883605",
      holder: "Roble Constructora del Peru SAC"
    }
  ],
  commercialDefaults: {
    currency: "PEN",
    validDays: 7,
    separationAmount: 1000,
    defaultNotes: "Forma de pago: S/ 1,000 de separación y cuota inicial completada en máximo 15 días.\nTiempo de validez de la proforma 7 días calendarios.\nEntrega de puntos de riego presurizado y título independizado en Sunarp."
  },
  advisor: SEED_ADVISORS[0],
  advisors: SEED_ADVISORS,
  whatsappMessageTemplate: "Hola {cliente}, le saluda {asesor} de Valle Pacora. Le comparto su cotización formal {codigo} por su Parcela Agrícola de {monto}:\n\nPuede revisarla en línea y descargar el PDF oficial aquí:\n{enlace}\n\nQuedo a su disposición para coordinar los siguientes pasos de su separación."
};
