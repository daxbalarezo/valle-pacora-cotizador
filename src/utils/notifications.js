export function getProformaNotificationData(proformas) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications = [];

  proformas.forEach(proforma => {
    // Excluir proformas ya cerradas
    if (proforma.status === 'aprobada' || proforma.status === 'rechazada') {
      return;
    }

    if (!proforma.createdAt) return;

    const emissionDate = new Date(proforma.createdAt);
    if (isNaN(emissionDate.getTime())) return;
    emissionDate.setHours(0, 0, 0, 0);

    const expirationDate = new Date(emissionDate);
    expirationDate.setDate(expirationDate.getDate() + 7);

    const diffTime = expirationDate.getTime() - today.getTime();
    // Usar Math.round para evitar problemas con cambios de horario de verano (DST)
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Si faltan más de 3 días, no genera alerta
    if (diffDays > 3) return;

    let group = '';
    let priority = 0;
    
    if (diffDays >= 0 && diffDays <= 3) {
      group = 'PRÓXIMA A VENCER';
      priority = 1;
    } else if (diffDays < 0) {
      group = 'VENCIDA';
      priority = 2;
    }

    notifications.push({
      ...proforma,
      emissionDate,
      expirationDate,
      diffDays,
      group,
      priority
    });
  });

  // Ordenar: primero urgencia (menor priority), luego fecha de vencimiento (menor diffDays)
  notifications.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.diffDays - b.diffDays;
  });

  return notifications;
}
