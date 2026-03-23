export interface BuyingInputs {
  homePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  propertyTaxPercent: number;
  homeInsurance: number;
  hoa: number;
  years: number;
}

export interface RentingInputs {
  monthlyRent: number;
  rentIncreasePercent: number;
  rentersInsurance: number;
  years: number;
}

export interface YearlyData {
  year: number;
  buyingNetWorth: number;
  rentingNetWorth: number;
  buyingTotalCost: number;
  rentingTotalCost: number;
  homeValue: number;
  homeMortageBalance: number;
  rentingInvestedBalance: number;
}

const ANNUAL_INVESTMENT_RETURN = 0.07;
const ANNUAL_HOME_APPRECIATION = 0.03;
const MAINTENANCE_RATE = 0.01;
const CLOSING_COSTS_PERCENT = 0.02;

export function calculateRentVsBuy(
  buying: BuyingInputs,
  renting: RentingInputs
): YearlyData[] {
  const results: YearlyData[] = [];
  
  const downPayment = buying.homePrice * (buying.downPaymentPercent / 100);
  const loanAmount = buying.homePrice - downPayment;
  const monthlyRate = buying.interestRate / 100 / 12;
  const numPayments = buying.years * 12;
  
  // Calculate monthly mortgage payment (P&I only)
  const monthlyPayment = 
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  let mortgageBalance = loanAmount;
  let homeValue = buying.homePrice;
  let cumulativeBuyingCost = downPayment * (1 + CLOSING_COSTS_PERCENT);
  let cumulativeRentingCost = 0;
  let investmentBalance = downPayment;
  
  for (let year = 1; year <= buying.years; year++) {
    // BUYING SIDE
    let yearlyMortgagePayment = 0;
    let yearlyPropertyTax = 0;
    let yearlyHomeInsurance = 0;
    let yearlyHOA = 0;
    let yearlyMaintenance = 0;
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;
    
    for (let month = 1; month <= 12; month++) {
      const interestPayment = mortgageBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      yearlyInterest += interestPayment;
      yearlyPrincipal += principalPayment;
      mortgageBalance -= principalPayment;
    }
    
    yearlyMortgagePayment = monthlyPayment * 12;
    yearlyPropertyTax = (homeValue * buying.propertyTaxPercent) / 100;
    yearlyHomeInsurance = buying.homeInsurance * 12;
    yearlyHOA = buying.hoa * 12;
    yearlyMaintenance = homeValue * MAINTENANCE_RATE;
    
    const totalBuyingCost = 
      yearlyMortgagePayment + 
      yearlyPropertyTax + 
      yearlyHomeInsurance + 
      yearlyHOA + 
      yearlyMaintenance;
    
    cumulativeBuyingCost += totalBuyingCost;
    
    // Appreciate home value
    homeValue *= 1 + ANNUAL_HOME_APPRECIATION;
    
    // RENTING SIDE
    let rentThisYear = renting.monthlyRent;
    if (year > 1) {
      rentThisYear = renting.monthlyRent * Math.pow(1 + renting.rentIncreasePercent / 100, year - 1);
    }
    
    const yearlyRent = rentThisYear * 12;
    const yearlyRentersInsurance = renting.rentersInsurance * 12;
    const totalRentingCost = yearlyRent + yearlyRentersInsurance;
    
    cumulativeRentingCost += totalRentingCost;
    
    // OPPORTUNITY COST: Invest the down payment + any savings
    const buyingMonthlyExpense = monthlyPayment + 
      (buying.propertyTaxPercent / 100 * homeValue / 12) +
      (buying.homeInsurance) +
      (buying.hoa) +
      (homeValue * MAINTENANCE_RATE / 12);
    
    const rentingMonthlyExpense = rentThisYear + (renting.rentersInsurance);
    const monthlySavings = Math.max(0, buyingMonthlyExpense - rentingMonthlyExpense);
    
    // Invest monthly savings + compound previous investment
    investmentBalance *= 1 + ANNUAL_INVESTMENT_RETURN;
    investmentBalance += monthlySavings * 12 * (1 + ANNUAL_INVESTMENT_RETURN / 2); // Half year average
    
    // NET WORTH CALCULATIONS
    const buyingNetWorth = homeValue - mortgageBalance;
    const rentingNetWorth = investmentBalance;
    
    results.push({
      year,
      buyingNetWorth,
      rentingNetWorth,
      buyingTotalCost: cumulativeBuyingCost,
      rentingTotalCost: cumulativeRentingCost,
      homeValue,
      homeMortageBalance: mortgageBalance,
      rentingInvestedBalance: investmentBalance,
    });
  }
  
  return results;
}

export function findBreakevenYear(data: YearlyData[]): number | null {
  for (let i = 1; i < data.length; i++) {
    if (data[i].buyingNetWorth > data[i].rentingNetWorth) {
      return data[i].year;
    }
  }
  return null;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
