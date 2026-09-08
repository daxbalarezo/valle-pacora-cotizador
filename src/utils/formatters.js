/**
 * Utilidades de formateo de moneda, fechas y texto
 */

export function formatCurrency(amount, currency = 'PEN') {
  const numericValue = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const formatted = numericValue.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === 'USD') {
    return `$ ${formatted}`;
  }
  return `S/ ${formatted}`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateToken() {
  return 'p_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Normaliza cualquier entrada de teléfono al estándar de salida "+51 xxx xxx xxx"
 * Permite borrar, editar y cambiar libremente el número sin bloquearse en "+51".
 */
export function formatPhoneNumber(input) {
  if (!input) return '';
  let str = String(input).trim();
  if (!str) return '';

  // Si el usuario borró todo o solo quedan caracteres de prefijo (+, +5, +51)
  if (/^(\+?5?1?\s*|\+)$/.test(str)) {
    return '';
  }

  // Extraer sólo dígitos
  let digits = str.replace(/\D/g, '');
  if (!digits) return '';

  // Quitar prefijo 51 si está presente al inicio
  // En Perú los números celulares tienen 9 dígitos y empiezan con 9 (9XX XXX XXX).
  if (str.startsWith('+51') && digits.startsWith('51') && digits.length > 2) {
    digits = digits.slice(2);
  } else if (digits.startsWith('519') && digits.length >= 3) {
    digits = digits.slice(2);
  } else if (digits.startsWith('51') && digits.length > 9) {
    digits = digits.slice(2);
  }

  // Quitar 51 repetidos si los hubiera por desajustes anteriores (ej. 515151...)
  while (digits.startsWith('51') && digits.length > 9) {
    digits = digits.slice(2);
  }

  // Quitar cero inicial si lo hubieran puesto
  if (digits.startsWith('0') && digits.length > 1) {
    digits = digits.slice(1);
  }

  // Máximo 9 dígitos de celular peruano
  digits = digits.slice(0, 9);
  if (!digits) return '';

  if (digits.length <= 3) {
    return `+51 ${digits}`;
  }
  if (digits.length <= 6) {
    return `+51 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return `+51 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
}

/**
 * Genera el formato numérico internacional limpio requerido por la API de WhatsApp (ej. "51987654321")
 */
export function getWhatsAppCleanPhone(input) {
  if (!input) return '';
  let digits = String(input).replace(/\D/g, '');
  if (!digits) return '';

  // Si ya tiene 11 dígitos y empieza con 51 (ej. 51987654321)
  if (digits.startsWith('51') && digits.length >= 11) {
    return digits;
  }

  // Si tiene 9 dígitos peruanos (ej. 987654321)
  if (digits.length === 9) {
    return `51${digits}`;
  }

  // Si tiene prefijo 0 (ej. 0987654321)
  if (digits.startsWith('0') && digits.length === 10) {
    return `51${digits.slice(1)}`;
  }

  // Si tiene más de 9 dígitos pero no empieza con 51
  if (digits.length >= 9) {
    const last9 = digits.slice(-9);
    return `51${last9}`;
  }

  return digits.startsWith('51') ? digits : `51${digits}`;
}

/**
 * Normaliza nombres para que la primera letra de cada palabra sea mayúscula (Title Case)
 * Ejemplo: "carlos alberto mendoza peña" -> "Carlos Alberto Mendoza Peña"
 * Ejemplo: "inversiones andinas s.a.c." -> "Inversiones Andinas S.A.C."
 */
export function normalizeName(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  const minorWords = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'en']);

  const words = trimmed.toLowerCase().split(/(\s+)/);

  return words.map((part, index) => {
    if (/^\s+$/.test(part)) return part;
    if (!part) return '';

    const upper = part.toUpperCase();
    if (['SAC', 'S.A.C.', 'EIRL', 'E.I.R.L.', 'SRL', 'S.R.L.', 'SA', 'S.A.'].includes(upper)) {
      return upper;
    }

    if (index === 0 || !minorWords.has(part)) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return part;
  }).join('');
}

/**
 * Capitaliza en vivo la primera letra de las palabras mientras el usuario escribe en un input
 */
export function liveCapitalizeName(input) {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/(^|[\s\-\.])[a-záéíóúñ]/gi, (char) => char.toUpperCase());
}
