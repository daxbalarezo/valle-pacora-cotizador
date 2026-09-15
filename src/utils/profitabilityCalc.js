import { formatCurrency } from './formatters';

export function getPaltaProjection(quantity = 1) {
  const currentYear = new Date().getFullYear(); // 2026
  
  const plantsPerParcel = 80;
  const pricePerKg = 15.20; 
  const maintenanceCostPerParcel = 6000;
  const exportCostRate = 0.12; 

  const totalPlants = plantsPerParcel * quantity;

  // Cosecha (KG por planton en cada ano):
  // 1ro (2028): 12 kg
  // 2do (2029): 24 kg
  // 3ro (2030): 35 kg
  // 4to-15vo: 35 kg

  const years = [];

  // Fase 1: Inversion
  years.push({
    period: `${currentYear} - ${currentYear + 1}`,
    production: 'Fase de Inversión',
    revenue: 0,
    costs: 0,
    profit: 0,
    isInvestment: true,
    label: 'Compra de semilla e injertado / Transplante y cuidado (fase de inversión, sin producción)'
  });

  let totalRevenue = 0;
  let totalProfit = 0;

  // Calculador interno
  const calcRow = (yearIndex, kgPerPlant, multiplier = 1) => {
    const totalKg = kgPerPlant * totalPlants;
    const revenue = totalKg * pricePerKg;
    const maintenanceCost = maintenanceCostPerParcel * quantity;
    const grossProfit = revenue - maintenanceCost;
    
    // Costo de exportación es el 12% de la utilidad bruta (Ingreso - Mantenimiento)
    const exportCost = grossProfit > 0 ? grossProfit * exportCostRate : 0; 
    const cost = maintenanceCost + exportCost;
    const profit = revenue - cost;

    return { totalKg, revenue, cost, profit };
  };

  // Ano 1 (2028)
  const y1 = calcRow(1, 12);
  years.push({
    period: `${currentYear + 2}`,
    production: `${(y1.totalKg).toLocaleString()} kg`,
    revenue: y1.revenue,
    costs: y1.cost,
    profit: y1.profit
  });
  totalRevenue += y1.revenue;
  totalProfit += y1.profit;

  // Ano 2 (2029)
  const y2 = calcRow(2, 24);
  years.push({
    period: `${currentYear + 3}`,
    production: `${(y2.totalKg).toLocaleString()} kg`,
    revenue: y2.revenue,
    costs: y2.cost,
    profit: y2.profit
  });
  totalRevenue += y2.revenue;
  totalProfit += y2.profit;

  // Ano 3 (2030)
  const y3 = calcRow(3, 35);
  years.push({
    period: `${currentYear + 4}`,
    production: `${(y3.totalKg).toLocaleString()} kg`,
    revenue: y3.revenue,
    costs: y3.cost,
    profit: y3.profit
  });
  totalRevenue += y3.revenue;
  totalProfit += y3.profit;

  // Ano 4 al 15 (Meseta - 12 cosechas)
  const y4 = calcRow(4, 35);
  years.push({
    period: `${currentYear + 5} - ${currentYear + 16}`,
    badge: '12 COSECHAS',
    production: `${(y4.totalKg).toLocaleString()} kg / año`,
    revenue: y4.revenue,
    costs: y4.cost,
    profit: y4.profit,
    isPlateau: true
  });
  totalRevenue += (y4.revenue * 12);
  totalProfit += (y4.profit * 12);

  return {
    rows: years,
    totalRevenue,
    totalProfit,
    totalYears: 15
  };
}

export function getArandanoProjection(quantity = 1) {
  const currentYear = new Date().getFullYear(); 
  
  const plantsPerParcel = 600; // Asumido: 1200 / 2
  const totalPlants = plantsPerParcel * quantity;
  const pricePerKg = 26.80;
  
  // Costos por 2 parcelas en excel = 29000 (prod) + 14000 (admin) = 43000
  // Costo por 1 parcela = 21500
  const totalCostPerYear = 21500 * quantity;

  // Rendimiento KG x Planta:
  // Ano 1: 3
  // Ano 2: 4
  // Ano 3: 5
  // Ano 4-11: 6

  const years = [];

  // Fase 1: Inversion
  years.push({
    period: `${currentYear} - ${currentYear + 1}`,
    production: 'Fase de Inversión',
    revenue: 0,
    costs: 0,
    profit: 0,
    isInvestment: true,
    label: 'Preparación de terreno, siembra y etapa vegetativa (sin producción)'
  });

  let totalRevenue = 0;
  let totalProfit = 0;

  const calcRow = (kgPerPlant) => {
    const grossKg = kgPerPlant * totalPlants;
    const exportableKg = grossKg * 0.95; // 95% exportable
    const revenue = exportableKg * pricePerKg;
    const profit = revenue - totalCostPerYear;
    return { grossKg, revenue, cost: totalCostPerYear, profit };
  };

  // Ano 1
  const y1 = calcRow(3);
  years.push({
    period: `${currentYear + 2}`,
    production: `${(y1.grossKg).toLocaleString()} kg`,
    revenue: y1.revenue,
    costs: y1.cost,
    profit: y1.profit
  });
  totalRevenue += y1.revenue;
  totalProfit += y1.profit;

  // Ano 2
  const y2 = calcRow(4);
  years.push({
    period: `${currentYear + 3}`,
    production: `${(y2.grossKg).toLocaleString()} kg`,
    revenue: y2.revenue,
    costs: y2.cost,
    profit: y2.profit
  });
  totalRevenue += y2.revenue;
  totalProfit += y2.profit;

  // Ano 3
  const y3 = calcRow(5);
  years.push({
    period: `${currentYear + 4}`,
    production: `${(y3.grossKg).toLocaleString()} kg`,
    revenue: y3.revenue,
    costs: y3.cost,
    profit: y3.profit
  });
  totalRevenue += y3.revenue;
  totalProfit += y3.profit;

  // Ano 4-11 (Meseta de 8 cosechas)
  const y4 = calcRow(6);
  years.push({
    period: `${currentYear + 5} - ${currentYear + 12}`,
    badge: '8 COSECHAS',
    production: `${(y4.grossKg).toLocaleString()} kg / año`,
    revenue: y4.revenue,
    costs: y4.cost,
    profit: y4.profit,
    isPlateau: true
  });
  totalRevenue += (y4.revenue * 8);
  totalProfit += (y4.profit * 8);

  return {
    rows: years,
    totalRevenue,
    totalProfit,
    totalYears: 11
  };
}
