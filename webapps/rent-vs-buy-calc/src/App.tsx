import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Home, Building2, TrendingUp, Trophy, Minus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import type { BuyingInputs, RentingInputs } from './utils/calculations'
import { calculateRentVsBuy, findBreakevenYear, formatCurrency } from './utils/calculations'

// ─── Input Slider Row ────────────────────────────────────────────────────────

function InputSlider({
  label,
  value,
  onValueChange,
  min, max, step,
  format,
  variant = 'buy',
}: {
  label: string
  value: number
  onValueChange: (v: number) => void
  min: number
  max: number
  step: number
  format: (v: number) => string
  variant?: 'buy' | 'rent'
}) {
  const isBuy = variant === 'buy'
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
          {label}
        </span>
        <span
          className={cn(
            'text-xs font-bold tabular-nums rounded-lg px-2 py-0.5 border',
            isBuy
              ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
              : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
          )}
        >
          {format(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onValueChange(v ?? 0)}
        min={min}
        max={max}
        step={step}
        rangeClassName={isBuy ? 'bg-indigo-500' : 'bg-amber-500'}
        thumbClassName={isBuy ? 'border-indigo-500' : 'border-amber-500 hover:border-amber-400'}
      />
    </div>
  )
}

// ─── Dollar Input Row ────────────────────────────────────────────────────────

function DollarInput({
  label,
  value,
  onChange,
  variant = 'buy',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  variant?: 'buy' | 'rent'
}) {
  const isBuy = variant === 'buy'
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
        {label}
      </label>
      <div
        className={cn(
          'flex items-center rounded-xl border bg-zinc-900/80 overflow-hidden focus-within:ring-1 transition-all',
          isBuy
            ? 'border-zinc-800 focus-within:ring-indigo-500 focus-within:border-indigo-500/40'
            : 'border-zinc-800 focus-within:ring-amber-500 focus-within:border-amber-500/40'
        )}
      >
        <span className="px-3 py-2 text-xs font-bold text-zinc-600 bg-zinc-800/50 border-r border-zinc-800 select-none">
          $
        </span>
        <Input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="border-0 bg-transparent focus-visible:ring-0 rounded-none h-9 text-sm font-semibold"
        />
      </div>
    </div>
  )
}

// ─── Metric Stat ─────────────────────────────────────────────────────────────

function Stat({
  label, value, sub, accent = false,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div className={cn('space-y-0.5', accent && 'opacity-100')}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{label}</p>
      <p className={cn('text-xl font-black tabular-nums tracking-tight', accent ? 'text-zinc-100' : 'text-zinc-200')}>
        {value}
      </p>
      <p className="text-[11px] text-zinc-600">{sub}</p>
    </div>
  )
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
  })

  const [renting, setRenting] = useState<RentingInputs>({
    monthlyRent: 2000,
    rentIncreasePercent: 3,
    rentersInsurance: 15,
    years: 30,
  })

  const years = renting.years

  const setYears = (y: number) => {
    setBuying(b => ({ ...b, years: y }))
    setRenting(r => ({ ...r, years: y }))
  }

  const data = useMemo(
    () => calculateRentVsBuy({ ...buying, years }, { ...renting, years }),
    [buying, renting, years]
  )

  const breakeven = useMemo(() => findBreakevenYear(data), [data])
  const finalBuy  = data[data.length - 1]?.buyingNetWorth  ?? 0
  const finalRent = data[data.length - 1]?.rentingNetWorth ?? 0
  const diff      = finalBuy - finalRent
  const buyWins   = diff > 0
  const winColor  = buyWins ? '#6366f1' : '#f59e0b'

  // Monthly costs at start
  const loan = buying.homePrice * (1 - buying.downPaymentPercent / 100)
  const mr   = buying.interestRate / 100 / 12
  const mn   = years * 12
  const mortgage = mr > 0 ? (loan * mr * Math.pow(1 + mr, mn)) / (Math.pow(1 + mr, mn) - 1) : loan / mn

  const buyCosts = [
    { label: 'Mortgage P&I', value: mortgage },
    { label: 'Property Tax', value: buying.homePrice * buying.propertyTaxPercent / 100 / 12 },
    { label: 'Insurance',    value: buying.homeInsurance },
    { label: 'HOA',          value: buying.hoa },
    { label: 'Maintenance',  value: buying.homePrice * 0.01 / 12 },
  ]
  const rentCosts = [
    { label: 'Monthly Rent',      value: renting.monthlyRent },
    { label: 'Renters Insurance', value: renting.rentersInsurance },
  ]
  const totalBuy  = buyCosts.reduce((s, c) => s + c.value, 0)
  const totalRent = rentCosts.reduce((s, c) => s + c.value, 0)
  const maxBar    = Math.max(totalBuy, totalRent)

  // Net worth bar split
  const nwTotal   = finalBuy + finalRent
  const buyPct    = nwTotal > 0 ? (finalBuy  / nwTotal) * 100 : 50
  const rentPct   = nwTotal > 0 ? (finalRent / nwTotal) * 100 : 50

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1160px] px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.35)] flex-shrink-0">
              <Home className="h-4 w-4 text-white" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold text-zinc-100 tracking-tight">Rent vs. Buy</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Financial comparison calculator</p>
            </div>
          </div>

          {/* Time horizon — shadcn Tabs */}
          <Tabs value={String(years)} onValueChange={v => setYears(Number(v))}>
            <TabsList>
              {[20, 25, 30].map(y => (
                <TabsTrigger key={y} value={String(y)}>{y} yr</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* ── Main grid ── */}
      <main className="mx-auto max-w-[1160px] px-6 py-8 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

        {/* ═══ LEFT: Inputs ═══ */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-[57px] lg:self-start lg:max-h-[calc(100vh-73px)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">

          {/* Buying card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                  <Home className="h-3.5 w-3.5 text-indigo-400" />
                </span>
                Buying
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <InputSlider label="Home Price"       value={buying.homePrice}          onValueChange={v => setBuying(b => ({ ...b, homePrice: v }))}          min={100000} max={1500000} step={10000} format={v => formatCurrency(v)}      variant="buy" />
              <InputSlider label="Down Payment"     value={buying.downPaymentPercent} onValueChange={v => setBuying(b => ({ ...b, downPaymentPercent: v }))} min={3}      max={50}      step={1}     format={v => `${v}%`}                  variant="buy" />
              <InputSlider label="Interest Rate"    value={buying.interestRate}       onValueChange={v => setBuying(b => ({ ...b, interestRate: v }))}       min={2}      max={12}      step={0.1}   format={v => `${v.toFixed(1)}%`}       variant="buy" />
              <InputSlider label="Property Tax"     value={buying.propertyTaxPercent} onValueChange={v => setBuying(b => ({ ...b, propertyTaxPercent: v }))} min={0.3}    max={3}       step={0.1}   format={v => `${v.toFixed(1)}%`}       variant="buy" />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <DollarInput label="Insurance /mo" value={buying.homeInsurance} onChange={v => setBuying(b => ({ ...b, homeInsurance: v }))} variant="buy" />
                <DollarInput label="HOA /mo"       value={buying.hoa}           onChange={v => setBuying(b => ({ ...b, hoa: v }))}           variant="buy" />
              </div>
            </CardContent>
          </Card>

          {/* Renting card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                </span>
                Renting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <InputSlider label="Monthly Rent"         value={renting.monthlyRent}         onValueChange={v => setRenting(r => ({ ...r, monthlyRent: v }))}         min={500} max={8000} step={50}  format={v => formatCurrency(v)}  variant="rent" />
              <InputSlider label="Annual Rent Increase" value={renting.rentIncreasePercent}  onValueChange={v => setRenting(r => ({ ...r, rentIncreasePercent: v }))}  min={0}   max={7}    step={0.1} format={v => `${v.toFixed(1)}%`} variant="rent" />
              <DollarInput label="Renters Insurance /mo" value={renting.rentersInsurance} onChange={v => setRenting(r => ({ ...r, rentersInsurance: v }))} variant="rent" />
            </CardContent>
          </Card>

          {/* Assumptions note */}
          <p className="text-[11px] text-zinc-600 leading-relaxed px-1">
            Assumes 7% investment returns on savings &amp; opportunity cost, 3% home appreciation, 1% annual maintenance.
          </p>
        </aside>

        {/* ═══ RIGHT: Results ═══ */}
        <div className="flex flex-col gap-5">

          {/* ── Verdict hero ── */}
          <div
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-md shadow-[0_4px_32px_rgba(0,0,0,0.4)]"
            style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)` }}
          >
            {/* Radial glow behind the number */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 60% 50%, ${winColor}1a 0%, transparent 65%)`,
              }}
            />
            <div className="relative p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  {/* Badge */}
                  <div
                    className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ background: `${winColor}18`, color: winColor, border: `1px solid ${winColor}30` }}
                  >
                    <Trophy className="h-3 w-3" />
                    {buyWins ? 'Buying wins' : 'Renting wins'}
                  </div>
                  <p className="text-sm text-zinc-500 font-medium mb-1.5">Better net worth over {years} years</p>
                  <p className="text-[52px] font-black text-white tabular-nums tracking-[-0.03em] leading-none">
                    {formatCurrency(Math.abs(diff))}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    vs. {buyWins ? 'renting' : 'buying'}
                  </p>
                </div>

                {/* Quick stats column */}
                <div className="hidden sm:flex flex-col gap-5 text-right">
                  <Stat
                    label="Buying"
                    value={formatCurrency(finalBuy)}
                    sub="net worth"
                    accent={buyWins}
                  />
                  <Stat
                    label="Renting"
                    value={formatCurrency(finalRent)}
                    sub="net worth"
                    accent={!buyWins}
                  />
                </div>
              </div>

              {/* Footer row */}
              {breakeven ? (
                <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: winColor }} />
                  <p className="text-sm text-zinc-500">
                    Buying overtakes renting at{' '}
                    <span className="font-bold text-zinc-200">Year {breakeven}</span>
                  </p>
                </div>
              ) : !buyWins ? (
                <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center gap-2">
                  <Minus className="h-3.5 w-3.5 text-zinc-600" />
                  <p className="text-sm text-zinc-500">
                    Renting stays ahead for the entire {years}-year period
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* ── Net worth comparison ── */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 mb-4">
                Net Worth After {years} Years
              </p>
              {/* Split bar */}
              <div className="flex h-2 gap-0.5 rounded-full overflow-hidden mb-5 bg-zinc-800">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{ width: `${buyPct}%`, background: 'linear-gradient(90deg, #818cf8, #6366f1)' }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500"
                  style={{ width: `${rentPct}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Buying */}
                <div className={cn('rounded-xl p-4 border transition-colors', buyWins ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-zinc-800 bg-zinc-900/40')}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="h-2 w-2 rounded bg-indigo-500" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">Buying</span>
                    {buyWins && (
                      <span className="ml-auto text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md">
                        WINNER
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-black text-zinc-100 tabular-nums tracking-tight">{formatCurrency(finalBuy)}</p>
                </div>
                {/* Renting */}
                <div className={cn('rounded-xl p-4 border transition-colors', !buyWins ? 'border-amber-500/20 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/40')}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="h-2 w-2 rounded bg-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">Renting</span>
                    {!buyWins && (
                      <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md">
                        WINNER
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-black text-zinc-100 tabular-nums tracking-tight">{formatCurrency(finalRent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Chart ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-zinc-500" />
                Net Worth Over Time
                <div className="ml-auto flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-[11px] text-zinc-500">Buying</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] text-zinc-500">Renting</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBuy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gRent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickLine={false} axisLine={false}
                    tick={{ fontSize: 11, fill: '#52525b' }}
                    tickFormatter={v => `Yr ${v as number}`}
                  />
                  <YAxis
                    tickLine={false} axisLine={false} width={56}
                    tick={{ fontSize: 11, fill: '#52525b' }}
                    tickFormatter={v =>
                      (v as number) >= 1_000_000
                        ? `$${((v as number) / 1_000_000).toFixed(1)}M`
                        : `$${((v as number) / 1000).toFixed(0)}k`
                    }
                  />
                  {breakeven && (
                    <ReferenceLine
                      x={breakeven}
                      stroke="#6366f150"
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                      label={{ value: `Yr ${breakeven}`, fill: '#818cf8', fontSize: 10, fontWeight: 700, dy: -8 }}
                    />
                  )}
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(9,9,11,0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(12px)',
                    }}
                    labelStyle={{ color: '#52525b', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    itemStyle={{ color: '#e4e4e7', fontSize: 12, fontWeight: 700, padding: '2px 0' }}
                    formatter={(v: unknown) => [formatCurrency(Number(v)), '']}
                    labelFormatter={l => `Year ${l as number}`}
                    cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="buyingNetWorth"  name="Buying"  stroke="#6366f1" strokeWidth={2} fill="url(#gBuy)"  dot={false} activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="rentingNetWorth" name="Renting" stroke="#f59e0b" strokeWidth={2} fill="url(#gRent)" dot={false} activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ── Monthly cost breakdown ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Monthly Costs at Start</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg tabular-nums">
                    {formatCurrency(totalBuy)}<span className="text-indigo-500/60 font-medium">/mo</span>
                  </span>
                  <span className="text-zinc-700 text-xs">vs</span>
                  <span className="text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg tabular-nums">
                    {formatCurrency(totalRent)}<span className="text-amber-500/60 font-medium">/mo</span>
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-6">
                {/* Buying column */}
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="h-2 w-2 rounded bg-indigo-500" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">Buying</span>
                  </div>
                  <div className="space-y-3">
                    {buyCosts.map(c => (
                      <div key={c.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-zinc-500">{c.label}</span>
                          <span className="text-[11px] font-bold text-zinc-300 tabular-nums">{formatCurrency(c.value)}</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500/60 rounded-full transition-all duration-300"
                            style={{ width: `${(c.value / maxBar) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Renting column */}
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="h-2 w-2 rounded bg-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">Renting</span>
                  </div>
                  <div className="space-y-3">
                    {rentCosts.map(c => (
                      <div key={c.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-zinc-500">{c.label}</span>
                          <span className="text-[11px] font-bold text-zinc-300 tabular-nums">{formatCurrency(c.value)}</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500/60 rounded-full transition-all duration-300"
                            style={{ width: `${(c.value / maxBar) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {totalBuy > totalRent && (
                      <div className="mt-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          Renter invests{' '}
                          <span className="font-bold text-amber-400">{formatCurrency(totalBuy - totalRent)}/mo</span>
                          {' '}in savings at 7% annually
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Year selector (mobile, since header is sticky on desktop) ── */}
          <div className="lg:hidden">
            <Card>
              <CardContent className="pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 mb-3">Analysis Period</p>
                <div className="flex gap-2">
                  {[20, 25, 30].map(y => (
                    <Button
                      key={y}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'flex-1',
                        years === y && 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'
                      )}
                      onClick={() => setYears(y)}
                    >
                      {y} yr
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}
