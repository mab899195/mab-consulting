import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Home, DollarSign, TrendingUp } from 'lucide-react';
import type {
  BuyingInputs,
  RentingInputs,
} from './utils/calculations';
import {
  calculateRentVsBuy,
  findBreakevenYear,
  formatCurrency,
} from './utils/calculations';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Rent vs. Buy Calculator
          </h1>
          <p className="text-slate-400">
            Compare your financial scenarios with sophisticated first-principles calculation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Inputs */}
          <div className="space-y-6">
            {/* Buying Inputs */}
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-white">Buying Scenario</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Home Price: {formatCurrency(buying.homePrice)}
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="1000000"
                    step="10000"
                    value={buying.homePrice}
                    onChange={(e) =>
                      setBuying({ ...buying, homePrice: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Down Payment: {buying.downPaymentPercent}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={buying.downPaymentPercent}
                    onChange={(e) =>
                      setBuying({ ...buying, downPaymentPercent: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Interest Rate: {buying.interestRate}%
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="0.1"
                    value={buying.interestRate}
                    onChange={(e) =>
                      setBuying({ ...buying, interestRate: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Property Tax: {buying.propertyTaxPercent}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={buying.propertyTaxPercent}
                    onChange={(e) =>
                      setBuying({ ...buying, propertyTaxPercent: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">
                      Home Insurance / Month
                    </label>
                    <input
                      type="number"
                      value={buying.homeInsurance}
                      onChange={(e) =>
                        setBuying({ ...buying, homeInsurance: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">
                      HOA / Month
                    </label>
                    <input
                      type="number"
                      value={buying.hoa}
                      onChange={(e) =>
                        setBuying({ ...buying, hoa: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Renting Inputs */}
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-white">Renting Scenario</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Monthly Rent: {formatCurrency(renting.monthlyRent)}
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="50"
                    value={renting.monthlyRent}
                    onChange={(e) =>
                      setRenting({ ...renting, monthlyRent: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Annual Rent Increase: {renting.rentIncreasePercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={renting.rentIncreasePercent}
                    onChange={(e) =>
                      setRenting({ ...renting, rentIncreasePercent: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Renter's Insurance / Month
                  </label>
                  <input
                    type="number"
                    value={renting.rentersInsurance}
                    onChange={(e) =>
                      setRenting({ ...renting, rentersInsurance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Time Horizon */}
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-white">Time Horizon</h2>
              </div>

              <div className="flex gap-2">
                {[20, 25, 30].map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setBuying({ ...buying, years: year });
                      setRenting({ ...renting, years: year });
                    }}
                    className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                      renting.years === year
                        ? 'bg-slate-500 text-white'
                        : 'bg-zinc-700 text-slate-300 hover:bg-zinc-600'
                    }`}
                  >
                    {year} years
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Charts & Results */}
          <div className="space-y-6">
            {/* Results Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Buy Net Worth</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(finalBuyingValue)}
                </p>
              </div>
              <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Rent Net Worth</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(finalRentingValue)}
                </p>
              </div>
            </div>

            {breakeven && (
              <div className="bg-gradient-to-r from-amber-950 to-amber-900 border border-amber-700 rounded-lg p-4">
                <p className="text-amber-300 text-sm mb-1">Break-Even Year</p>
                <p className="text-2xl font-bold text-white">Year {breakeven}</p>
              </div>
            )}

            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">
                {difference > 0 ? 'Buying Advantage' : 'Renting Advantage'}
              </p>
              <p
                className={`text-2xl font-bold ${
                  difference > 0 ? 'text-green-400' : 'text-blue-400'
                }`}
              >
                {formatCurrency(Math.abs(difference))}
              </p>
            </div>

            {/* Chart */}
            <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Net Worth Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404854" />
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #404854',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="buyingNetWorth"
                    stroke="#f97316"
                    name="Buying"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="rentingNetWorth"
                    stroke="#3b82f6"
                    name="Renting"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
