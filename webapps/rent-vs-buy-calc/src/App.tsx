import { useState, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from 'recharts';
import { Home, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import type { BuyingInputs, RentingInputs } from './utils/calculations';
import { calculateRentVsBuy, findBreakevenYear, formatCurrency } from './utils/calculations';

// ─── Slider ─────────────────────────────────────────────────────────────────

function Slider({
  label, value, onChange, min, max, step, format, accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number; max: number; step: number;
  format: (v: number) => string;
  accent: string;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="input-row">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
        <span className="value-chip" style={{ color: accent, borderColor: accent + '30', background: accent + '0d' }}>
          {format(value)}
        </span>
      </div>
      <div className="relative h-[20px] flex items-center">
        {/* Track */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-slate-100">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}80, ${accent})` }} />
        </div>
        {/* Thumb */}
        <div
          className="absolute size-[14px] rounded-full border-[2.5px] border-white shadow-md pointer-events-none"
          style={{ left: `${pct}%`, transform: 'translateX(-50%)', background: accent }}
        />
        {/* Native input (invisible, handles interaction) */}
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
      </div>
    </div>
  );
}

// ─── Dollar field ────────────────────────────────────────────────────────────

function DollarField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
      <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-slate-400 transition-colors">
        <span className="px-3 py-2.5 text-xs text-slate-400 bg-slate-50 border-r border-slate-200 select-none font-medium">$</span>
        <input
          type="number" value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none min-w-0 bg-white"
        />
      </div>
    </div>
  );
}

// ─── Input section card ──────────────────────────────────────────────────────

function Section({ children, icon, label, accent }: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: accent + '15' }}>
          <div style={{ color: accent }}>{icon}</div>
        </div>
        <span className="text-sm font-bold text-slate-800 tracking-tight">{label}</span>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

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

  const years = renting.years;
  const setYears = (y: number) => {
    setBuying(b => ({ ...b, years: y }));
    setRenting(r => ({ ...r, years: y }));
  };

  const data = useMemo(
    () => calculateRentVsBuy({ ...buying, years }, { ...renting, years }),
    [buying, renting, years]
  );

  const breakeven = useMemo(() => findBreakevenYear(data), [data]);
  const finalBuyingValue  = data[data.length - 1]?.buyingNetWorth  ?? 0;
  const finalRentingValue = data[data.length - 1]?.rentingNetWorth ?? 0;
  const difference = finalBuyingValue - finalRentingValue;
  const buyingWins = difference > 0;
  const winnerAccent = buyingWins ? '#6366f1' : '#f59e0b';

  // Monthly costs at start
  const loanAmount = buying.homePrice * (1 - buying.downPaymentPercent / 100);
  const mr = buying.interestRate / 100 / 12;
  const mn = years * 12;
  const monthlyMortgage = mr > 0
    ? (loanAmount * mr * Math.pow(1 + mr, mn)) / (Math.pow(1 + mr, mn) - 1)
    : loanAmount / mn;

  const buyCosts = [
    { label: 'Mortgage P&I',  value: monthlyMortgage },
    { label: 'Property Tax',  value: buying.homePrice * buying.propertyTaxPercent / 100 / 12 },
    { label: 'Insurance',     value: buying.homeInsurance },
    { label: 'HOA',           value: buying.hoa },
    { label: 'Maintenance',   value: buying.homePrice * 0.01 / 12 },
  ];
  const rentCosts = [
    { label: 'Monthly Rent',       value: renting.monthlyRent },
    { label: 'Renters Insurance',  value: renting.rentersInsurance },
  ];
  const totalBuy  = buyCosts.reduce((s, c) => s + c.value, 0);
  const totalRent = rentCosts.reduce((s, c) => s + c.value, 0);
  const maxCostBar = Math.max(totalBuy, totalRent);

  // Net worth split for bar
  const nwTotal  = finalBuyingValue + finalRentingValue;
  const buyBarPct  = nwTotal > 0 ? (finalBuyingValue  / nwTotal) * 100 : 50;
  const rentBarPct = nwTotal > 0 ? (finalRentingValue / nwTotal) * 100 : 50;

  return (
    <div className="app-root">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="flex items-center gap-3">
            <div className="header-logo">
              <Home className="size-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">Rent vs. Buy</h1>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-none">Financial comparison calculator</p>
            </div>
          </div>
          <div className="year-tabs">
            {[20, 25, 30].map(y => (
              <button key={y} onClick={() => setYears(y)} className={`year-tab ${years === y ? 'year-tab--active' : ''}`}>
                {y}yr
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main grid ── */}
      <main className="main-grid">

        {/* ── LEFT: Inputs ── */}
        <aside className="inputs-col">
          <Section label="Buying" icon={<Home className="size-3.5" />} accent="#6366f1">
            <Slider label="Home Price"       value={buying.homePrice}          onChange={v => setBuying(b => ({ ...b, homePrice: v }))}          min={100000} max={1500000} step={10000} format={v => formatCurrency(v)}      accent="#6366f1" />
            <Slider label="Down Payment"     value={buying.downPaymentPercent} onChange={v => setBuying(b => ({ ...b, downPaymentPercent: v }))} min={3}      max={50}      step={1}     format={v => `${v}%`}                  accent="#6366f1" />
            <Slider label="Interest Rate"    value={buying.interestRate}       onChange={v => setBuying(b => ({ ...b, interestRate: v }))}       min={2}      max={12}      step={0.1}   format={v => `${v.toFixed(1)}%`}       accent="#6366f1" />
            <Slider label="Property Tax"     value={buying.propertyTaxPercent} onChange={v => setBuying(b => ({ ...b, propertyTaxPercent: v }))} min={0.3}    max={3}       step={0.1}   format={v => `${v.toFixed(1)}%`}       accent="#6366f1" />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <DollarField label="Insurance /mo" value={buying.homeInsurance} onChange={v => setBuying(b => ({ ...b, homeInsurance: v }))} />
              <DollarField label="HOA /mo"       value={buying.hoa}           onChange={v => setBuying(b => ({ ...b, hoa: v }))} />
            </div>
          </Section>

          <Section label="Renting" icon={<Building2 className="size-3.5" />} accent="#f59e0b">
            <Slider label="Monthly Rent"         value={renting.monthlyRent}          onChange={v => setRenting(r => ({ ...r, monthlyRent: v }))}          min={500} max={8000} step={50}  format={v => formatCurrency(v)}  accent="#f59e0b" />
            <Slider label="Annual Rent Increase" value={renting.rentIncreasePercent}  onChange={v => setRenting(r => ({ ...r, rentIncreasePercent: v }))}  min={0}   max={7}    step={0.1} format={v => `${v.toFixed(1)}%`} accent="#f59e0b" />
            <DollarField label="Insurance /mo" value={renting.rentersInsurance} onChange={v => setRenting(r => ({ ...r, rentersInsurance: v }))} />
          </Section>
        </aside>

        {/* ── RIGHT: Results ── */}
        <div className="results-col">

          {/* Verdict */}
          <div className="verdict-card" style={{ '--winner': winnerAccent } as React.CSSProperties}>
            <div className="verdict-glow" style={{ background: `radial-gradient(ellipse at 75% 50%, ${winnerAccent}22 0%, transparent 65%)` }} />
            <div className="verdict-content">
              <div className="verdict-badge" style={{ background: winnerAccent + '1a', color: winnerAccent }}>
                <span className="verdict-badge-dot" style={{ background: winnerAccent }} />
                {buyingWins ? 'Buying wins' : 'Renting wins'}
              </div>
              <p className="verdict-label">better net worth over {years} years</p>
              <p className="verdict-amount">{formatCurrency(Math.abs(difference))}</p>
              <p className="verdict-sub">vs. {buyingWins ? 'renting' : 'buying'}</p>
            </div>
            {(breakeven || !buyingWins) && (
              <div className="verdict-footer">
                <div className="verdict-divider" />
                <p className="verdict-footnote">
                  {breakeven
                    ? <>Buying overtakes renting at <strong style={{ color: winnerAccent }}>Year {breakeven}</strong></>
                    : `Renting stays ahead for the full ${years}-year period`}
                </p>
              </div>
            )}
          </div>

          {/* Net Worth Comparison */}
          <div className="card">
            <p className="card-eyebrow">Net worth after {years} years</p>
            {/* Split bar */}
            <div className="nw-bar">
              <div className="nw-bar-segment nw-bar-buy"   style={{ width: `${buyBarPct}%`  }} />
              <div className="nw-bar-segment nw-bar-rent"  style={{ width: `${rentBarPct}%` }} />
            </div>
            <div className="nw-grid">
              {[
                { label: 'Buying',  value: finalBuyingValue,  color: '#6366f1', wins: buyingWins },
                { label: 'Renting', value: finalRentingValue, color: '#f59e0b', wins: !buyingWins },
              ].map(opt => (
                <div key={opt.label} className="nw-item">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="size-2 rounded-sm" style={{ background: opt.color }} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{opt.label}</span>
                    {opt.wins && (
                      <span className="nw-winner-badge" style={{ background: opt.color + '18', color: opt.color }}>
                        winner
                      </span>
                    )}
                  </div>
                  <p className="text-[22px] font-black text-slate-900 tabular-nums tracking-tight leading-none">
                    {formatCurrency(opt.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="size-4 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">Net Worth Over Time</p>
              <div className="ml-auto flex items-center gap-4">
                <div className="chart-legend-item">
                  <div className="size-2 rounded-full bg-indigo-500" />
                  <span className="text-[11px] text-slate-500 font-medium">Buying</span>
                </div>
                <div className="chart-legend-item">
                  <div className="size-2 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-slate-500 font-medium">Renting</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBuy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gRent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={v => `Yr ${v}`}
                />
                <YAxis tickLine={false} axisLine={false} width={54}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={v => v >= 1_000_000 ? `$${(v/1_000_000).toFixed(1)}M` : `$${(v/1000).toFixed(0)}k`}
                />
                {breakeven && (
                  <ReferenceLine x={breakeven} stroke="#6366f160" strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value: `Yr ${breakeven}`, fill: '#6366f1', fontSize: 10, fontWeight: 700, dy: -6 }}
                  />
                )}
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
                  labelStyle={{ color: '#64748b', fontSize: 11, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: 12, fontWeight: 700, padding: '2px 0' }}
                  formatter={(v: unknown) => [formatCurrency(Number(v)), '']}
                  labelFormatter={l => `Year ${l}`}
                  cursor={{ stroke: '#334155', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="buyingNetWorth"  name="Buying"  stroke="#6366f1" strokeWidth={2.5} fill="url(#gBuy)"  dot={false} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="rentingNetWorth" name="Renting" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gRent)" dot={false} activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Costs */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-slate-700">Monthly Costs at Start</p>
              <div className="flex items-center gap-3">
                <span className="cost-total cost-total--buy">{formatCurrency(totalBuy)}/mo</span>
                <ArrowRight className="size-3 text-slate-300" />
                <span className="cost-total cost-total--rent">{formatCurrency(totalRent)}/mo</span>
              </div>
            </div>

            <div className="cost-grid">
              {/* Buying column */}
              <div>
                <div className="cost-col-header" style={{ color: '#6366f1' }}>
                  <div className="size-2 rounded-sm bg-indigo-500" />
                  Buying
                </div>
                <div className="space-y-2.5">
                  {buyCosts.map(c => (
                    <div key={c.label} className="cost-row">
                      <span className="cost-label">{c.label}</span>
                      <div className="cost-bar-wrap">
                        <div className="cost-bar-track">
                          <div className="cost-bar-fill bg-indigo-400" style={{ width: `${(c.value / maxCostBar) * 100}%` }} />
                        </div>
                        <span className="cost-value">{formatCurrency(c.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Renting column */}
              <div>
                <div className="cost-col-header" style={{ color: '#f59e0b' }}>
                  <div className="size-2 rounded-sm bg-amber-400" />
                  Renting
                </div>
                <div className="space-y-2.5">
                  {rentCosts.map(c => (
                    <div key={c.label} className="cost-row">
                      <span className="cost-label">{c.label}</span>
                      <div className="cost-bar-wrap">
                        <div className="cost-bar-track">
                          <div className="cost-bar-fill bg-amber-400" style={{ width: `${(c.value / maxCostBar) * 100}%` }} />
                        </div>
                        <span className="cost-value">{formatCurrency(c.value)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="cost-savings-note">
                    Renter invests {formatCurrency(Math.max(0, totalBuy - totalRent))}/mo
                    savings at 7% annually
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="footer-note">
            Assumes 7% annual investment returns on savings &amp; down payment opportunity cost, 3% home appreciation, 1% maintenance. For educational purposes only.
          </p>
        </div>
      </main>
    </div>
  );
}
