"use client";

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function UltimateSIPCalculator() {
  // --- STATE MANAGEMENT ---
  const [investment, setInvestment] = useState(25000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const [stepUp, setStepUp] = useState(0); // Annual increase %
  const [inflation, setInflation] = useState(6);
  const [goal, setGoal] = useState(10000000); // 1 Crore default
  const [taxRate, setTaxRate] = useState(10); // LTCG Tax %

  // --- CALCULATION ENGINE ---
  const results = useMemo(() => {
    // 1. Calculate Future Value with Step-Up
    let totalInvested = 0;
    let futureValue = 0;
    let currentSIP = investment;
    
    const monthlyRate = rate / 12 / 100;
    const totalMonths = years * 12;
    
    // If Step-Up is 0, use standard formula for speed
    if (stepUp === 0) {
      totalInvested = investment * totalMonths;
      if (monthlyRate === 0) {
        futureValue = totalInvested;
      } else {
        futureValue = investment * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
      }
    } else {
      // Year-wise calculation for Step-Up
      let currentYearValue = 0;
      let monthsRemaining = totalMonths;
      
      for (let y = 0; y < years; y++) {
        const monthsInYear = 12;
        // FV for this specific year's SIPs
        // Formula: P * [ ((1+r)^n - 1) / r ] * (1+r)
        // But we need to compound this year's block for the remaining years
        
        const sipForYear = investment * Math.pow(1 + stepUp / 100, y);
        totalInvested += sipForYear * 12;
        
        // Compound this year's contributions for the remaining time
        const monthsLeftAfterYear = totalMonths - (y * 12);
        
        if (monthlyRate === 0) {
             futureValue += sipForYear * 12;
        } else {
             // Calculate FV of an annuity for 12 months, then compound it for remaining years
             const fvAnnuity = sipForYear * (((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) * (1 + monthlyRate));
             futureValue += fvAnnuity * Math.pow(1 + monthlyRate, monthsLeftAfterYear - 12);
        }
      }
    }

    // 2. Derived Metrics
    const wealthGained = Math.round(futureValue - totalInvested);
    const realValue = Math.round(futureValue / Math.pow(1 + inflation / 100, years));
    const estimatedTax = Math.round(wealthGained * (taxRate / 100)); // Simplified
    const postTaxValue = Math.round(futureValue - estimatedTax);
    
    // 3. Goal Progress
    const goalProgress = Math.min(100, (futureValue / goal) * 100);

    return {
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      wealthGained,
      realValue,
      estimatedTax,
      postTaxValue,
      goalProgress
    };
  }, [investment, rate, years, stepUp, inflation, goal, taxRate]);

  // --- CHART DATA ---
  const pieData = [
    { name: 'Wealth Gained', value: results.wealthGained, color: '#da3832' },
    { name: 'Total Invested', value: results.totalInvested, color: '#224c87' },
  ];

  // --- FORMATTER ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // --- RENDER ---
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-montserrat p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#224c87]">QUANTIS</h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest mt-1">Advanced SIP Planner</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT: INPUTS --- */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Core Inputs Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-5">
              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Monthly Investment</span>
                  <span className="text-[#224c87] font-bold">{formatCurrency(investment)}</span>
                </label>
                <input type="range" min="500" max="100000" step="500" value={investment} 
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#224c87]" />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Expected Return (p.a.)</span>
                  <span className="text-[#224c87] font-bold">{rate}%</span>
                </label>
                <input type="range" min="1" max="30" step="0.5" value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#224c87]" />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Duration</span>
                  <span className="text-[#224c87] font-bold">{years} Yrs</span>
                </label>
                <input type="range" min="1" max="40" value={years} 
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#224c87]" />
              </div>
            </div>

            {/* Advanced Inputs Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-5 border-l-4 border-l-[#da3832]">
              <h3 className="font-bold text-slate-800 text-sm">Advanced Assumptions</h3>
              
              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Annual Step-Up</span>
                  <span className="text-[#da3832] font-bold">{stepUp}%</span>
                </label>
                <input type="range" min="0" max="20" value={stepUp} 
                  onChange={(e) => setStepUp(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#da3832]" />
                <p className="text-[10px] text-slate-400 mt-1">Increase SIP every year</p>
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Inflation Rate</span>
                  <span className="text-slate-600 font-bold">{inflation}%</span>
                </label>
                <input type="range" min="0" max="15" step="0.5" value={inflation} 
                  onChange={(e) => setInflation(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-400" />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Tax Rate (LTCG)</span>
                  <span className="text-slate-600 font-bold">{taxRate}%</span>
                </label>
                <input type="range" min="0" max="30" value={taxRate} 
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-400" />
              </div>
              
              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Target Goal</span>
                  <span className="text-slate-600 font-bold">{formatCurrency(goal)}</span>
                </label>
                <input type="range" min="100000" max={100000000} step="100000" value={goal} 
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-400" />
              </div>
            </div>
          </div>

          {/* --- RIGHT: RESULTS --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Result Box */}
            <div className="bg-gradient-to-br from-[#224c87] to-[#1a3a66] p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
              
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-blue-100 text-xs uppercase tracking-widest mb-1">Projected Value</p>
                  <h2 className="text-4xl md:text-5xl font-bold mb-2">{formatCurrency(results.futureValue)}</h2>
                  
                  <div className="flex gap-4 mt-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-[10px] text-blue-200 uppercase">Invested</p>
                      <p className="font-bold">{formatCurrency(results.totalInvested)}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-[10px] text-blue-200 uppercase">Wealth Gained</p>
                      <p className="font-bold text-[#da3832]">{formatCurrency(results.wealthGained)}</p>
                    </div>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Insight Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Real Value */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Real Value (Today's Money)</p>
                </div>
                <p className="text-2xl font-bold text-slate-700">{formatCurrency(results.realValue)}</p>
                <p className="text-xs text-slate-400 mt-1">Adjusted for {inflation}% inflation</p>
              </div>

              {/* Post Tax */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-[#da3832] rounded-full"></div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Post-Tax Value</p>
                </div>
                <p className="text-2xl font-bold text-slate-700">{formatCurrency(results.postTaxValue)}</p>
                <p className="text-xs text-slate-400 mt-1">Est. Tax: {formatCurrency(results.estimatedTax)}</p>
              </div>

              {/* Goal Progress */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Goal Progress</p>
                </div>
                <div className="flex justify-between items-end mb-1">
                  <p className="text-2xl font-bold text-slate-700">{results.goalProgress.toFixed(0)}%</p>
                  <p className="text-xs text-slate-400">Target: {formatCurrency(goal)}</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${results.goalProgress >= 100 ? 'bg-green-500' : 'bg-[#224c87]'}`} 
                       style={{ width: `${results.goalProgress}%` }}></div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <footer className="text-center mt-8">
              <p className="text-[10px] text-slate-400 leading-relaxed px-4">
                <strong>Disclaimer:</strong> This tool has been designed for information purposes only. Actual results may vary depending on various factors involved in capital market. Investor should not consider above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}