import { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Home, Building2, TrendingUp, Info } from 'lucide-react';
import type {
  BuyingInputs,
  RentingInputs,
} from './utils/calculations';
import {
  calculateRentVsBuy,
  findBreakevenYear,
  formatCurrency,
} from './utils/calculations';

function InputSlider({ label, value, onChange, min, max, step, unit = '' }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-lg font-semibold text-blue-600">
          {unit === '$' ? formatCurrency(value) : `${value}${unit}`}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
}

function ResultCard({ title, value, subtitle, color = 'blue' }: {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-xl p-4`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}

export default function App() {
  const [buying, setBuying] = useState<BuyingInputs>({
    homePrice: 400000,
    downPaymentPercent: 20,
    interestRate: 6.5,
    propertyTaxPercent: 1.2,
    homeInsurance: 150,
    hoa: 0,
    years: 30,
  });

  const [renting, setRenting] = useState<RentingInputs>({
    monthlyRent: 2000,
    rentIncreasePercent: 3,
    rentersInsurance: 15,
    years: 30,
  });

  const data = useMemo(() => {
    const newBuying = { ...buying, years: renting.years };
    const newRenting = { ...renting, years: renting.years };
    return calculateRentVsBuy(newBuying, newRenting);
  }, [buying, renting]);

  const breakeven = useMemo(() => findBreakevenYear(data), [data]);

  const finalBuyingValue = data[data.length - 1]?.buyingNetWorth || 0;
  const finalRentingValue = data[data.length - 1]?.rentingNetWorth || 0;
  const difference = finalBuyingValue - finalRentingValue;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Rent vs. Buy</h1>
          </div>
          <p className="text-gray-600 max-w-2xl">
            Make an informed financial decision. Compare buying a home with renting over 20, 25, or 30 years.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Time Horizon Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Analysis Period</h3>
              <div className="grid grid-cols-3 gap-2">
                {[20, 25, 30].map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setBuying({ ...buying, years: year });
                      setRenting({ ...renting, years: year });
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                      renting.years === year
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {year}y
                  </button>
                ))}
              </div>
            </div>

            {/* Buying Inputs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Home className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Buying</h3>
              </div>
              <div className="space-y-5">
                <InputSlider
                  label="Home Price"
                  value={buying.homePrice}
                  onChange={(v) => setBuying({ ...buying, homePrice: v })}
                  min={100000}
                  max={1000000}
                  step={10000}
                  unit="$"
                />
                <InputSlider
                  label="Down Payment"
                  value={buying.downPaymentPercent}
                  onChange={(v) => setBuying({ ...buying, downPaymentPercent: v })}
                  min={5}
                  max={50}
                  step={1}
                  unit="%"
                />
                <InputSlider
                  label="Interest Rate"
                  value={buying.interestRate}
                  onChange={(v) => setBuying({ ...buying, interestRate: v })}
                  min={2}
                  max={10}
                  step={0.1}
                  unit="%"
                />
                <InputSlider
                  label="Property Tax"
                  value={buying.propertyTaxPercent}
                  onChange={(v) => setBuying({ ...buying, propertyTaxPercent: v })}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit="%"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance/mo
                    </label>
                    <input
                      type="number"
                      value={buying.homeInsurance}
                      onChange={(e) =>
                        setBuying({ ...buying, homeInsurance: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HOA/mo
                    </label>
                    <input
                      type="number"
                      value={buying.hoa}
                      onChange={(e) =>
                        setBuying({ ...buying, hoa: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Renting Inputs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900">Renting</h3>
              </div>
              <div className="space-y-5">
                <InputSlider
                  label="Monthly Rent"
                  value={renting.monthlyRent}
                  onChange={(v) => setRenting({ ...renting, monthlyRent: v })}
                  min={500}
                  max={5000}
                  step={50}
                  unit="$"
                />
                <InputSlider
                  label="Rent Increase/Year"
                  value={renting.rentIncreasePercent}
                  onChange={(v) => setRenting({ ...renting, rentIncreasePercent: v })}
                  min={0}
                  max={5}
                  step={0.1}
                  unit="%"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance/mo
                  </label>
                  <input
                    type="number"
                    value={renting.rentersInsurance}
                    onChange={(e) =>
                      setRenting({ ...renting, rentersInsurance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <ResultCard
                title="Buying Net Worth"
                value={formatCurrency(finalBuyingValue)}
                color="blue"
              />
              <ResultCard
                title="Renting Net Worth"
                value={formatCurrency(finalRentingValue)}
                color="orange"
              />
            </div>

            {/* Advantage Card */}
            <div className="grid grid-cols-2 gap-4">
              {breakeven && (
                <ResultCard
                  title="Break-Even Year"
                  value={`Year ${breakeven}`}
                  subtitle={`After ${breakeven} years, buying becomes advantageous`}
                  color="purple"
                />
              )}
              <div className={`rounded-xl p-4 border ${
                difference > 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-sm text-gray-600 mb-1">
                  {difference > 0 ? 'Buying Advantage' : 'Renting Advantage'}
                </p>
                <p className={`text-3xl font-bold ${
                  difference > 0 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {formatCurrency(Math.abs(difference))}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Net Worth Growth</h3>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBuying" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRenting" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="buyingNetWorth"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorBuying)"
                    name="Buying"
                  />
                  <Area
                    type="monotone"
                    dataKey="rentingNetWorth"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorRenting)"
                    name="Renting"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                This calculator includes opportunity cost: assumes down payment and monthly savings are invested at 7% annual returns. Home value appreciates at 3% yearly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
