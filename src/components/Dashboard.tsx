import React, { useState } from 'react';
import { Income, Loan, LoanPayment, Overtime, Expense } from '../types';
import { BULAN_LIST } from '../mockData';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Wallet,
  Activity
} from 'lucide-react';

interface DashboardProps {
  incomes: Income[];
  loans: Loan[];
  payments: LoanPayment[];
  overtimes: Overtime[];
  expenses: Expense[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ incomes, loans, payments, overtimes, expenses, onNavigate }: DashboardProps) {
  const currentYear = 2026;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // --- Calculations for Selected Year ---
  
  // 1. Total Income: Incomes + Overtime + Compensation for selected year
  const yearIncomes = incomes.filter(inc => inc.tahun === selectedYear);
  const totalBaseIncome = yearIncomes.reduce((sum, inc) => sum + inc.nominal, 0);

  const yearOvertimes = overtimes.filter(ot => ot.tahun === selectedYear);
  const totalOvertimeCompensation = yearOvertimes.reduce((sum, ot) => sum + ot.nominal, 0);

  const totalOverallIncome = totalBaseIncome + totalOvertimeCompensation;

  // 2. Total Pengeluaran: Daily Expenses + Loan payments made in selected year
  // Let's filter daily expenses
  const yearExpenses = expenses.filter(exp => exp.tanggal.startsWith(String(selectedYear)));
  const totalDailyExpenses = yearExpenses.reduce((sum, exp) => sum + exp.nominal, 0);

  // Loan payments actually paid in the selected year
  // In our schema, we can look at createdAt of payments or infer from loan_id. Let's look at payments with status 'Sudah Bayar' and created in selected year
  const yearPaymentspaid = payments.filter(pay => 
    pay.status === 'Sudah Bayar' && pay.createdAt.startsWith(String(selectedYear))
  );
  const totalLoanRepaymentsPaid = yearPaymentspaid.reduce((sum, pay) => sum + pay.nominal, 0);

  const totalOverallExpenses = totalDailyExpenses + totalLoanRepaymentsPaid;

  // 3. Sisa Pendapatan (Total Income - Total Pengeluaran)
  const netSavings = totalOverallIncome - totalOverallExpenses;

  // 4. Loan Stats
  const activeLoans = loans.filter(l => l.status === 'Aktif');
  const finishedLoans = loans.filter(l => l.status === 'Lunas');

  // Let's count upcoming/late payments (Belum Bayar or Jatuh Tempo Dekat)
  const upcomingPayments = payments.filter(pay => 
    (pay.status === 'Belum Bayar' || pay.status === 'Jatuh Tempo Dekat')
  ).length;

  const nearDuePayments = payments.filter(pay => pay.status === 'Jatuh Tempo Dekat').length;

  // --- Monthly breakdown for SVG Chart ---
  const monthlyData = BULAN_LIST.map((bulan, idx) => {
    // base income in this month
    const mIncomes = yearIncomes.filter(i => i.bulan === bulan);
    const mBaseInc = mIncomes.reduce((sum, i) => sum + i.nominal, 0);

    // overtime in this month
    const mOvertimes = yearOvertimes.filter(o => o.bulan === bulan);
    const mOt = mOvertimes.reduce((sum, o) => sum + o.nominal, 0);

    const mTotalIn = mBaseInc + mOt;

    // daily expenses in this month (tanggal: YYYY-MM-DD, index is idx + 1)
    const monthStr = String(idx + 1).padStart(2, '0');
    const mExpItems = yearExpenses.filter(e => e.tanggal.includes(`-${monthStr}-`));
    const mDailyExp = mExpItems.reduce((sum, e) => sum + e.nominal, 0);

    // payments in this month
    const mPayments = yearPaymentspaid.filter(p => p.bulan_bayar === bulan);
    const mPayVal = mPayments.reduce((sum, p) => sum + p.nominal, 0);

    const mTotalOut = mDailyExp + mPayVal;

    return {
      bulan,
      short: bulan.substring(0, 3),
      income: mTotalIn,
      expense: mTotalOut
    };
  });

  const maxVal = Math.max(
    ...monthlyData.map(d => Math.max(d.income, d.expense)),
    1000000 // avoid divide by zero, fallback min height scale
  );

  // Format currency helpers
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const expensePercentage = totalOverallIncome > 0 
    ? Math.min(Math.round((totalOverallExpenses / totalOverallIncome) * 100), 100) 
    : 0;

  return (
    <div className="space-y-8" id="dashboard-container">
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="dashboard-heading">
            Ringkasan Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Pemantauan performa pemasukan, pengeluaran, kompensasi, dan cicilan aktif Anda.
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun Anggaran:</span>
          <select 
            id="dashboard-year-select"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0" id="dashboard-primary-cards">
        {/* Total Income Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="card-total-income">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase mb-1 tracking-tight">Total Income ({selectedYear})</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight" id="val-total-income">
              {formatIDR(totalOverallIncome)}
            </h3>
          </div>
          <p className="text-[11px] text-indigo-700 font-bold mt-4 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 block animate-pulse"></span>
            Terdiri dari gaji pokok, tambahan lembur &amp; kompensasi
          </p>
        </div>

        {/* Total Pengeluaran Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="card-total-expense">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase mb-1 tracking-tight">Total Pengeluaran ({selectedYear})</p>
            <h3 className="text-3xl font-black text-rose-600 tracking-tight" id="val-total-expense">
              {formatIDR(totalOverallExpenses)}
            </h3>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full" style={{ width: `${expensePercentage}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              {expensePercentage}% alokasi dari pendapatan aktif
            </p>
          </div>
        </div>

        {/* Sisa Pendapatan Card */}
        <div className={`p-5 rounded-xl border shadow-sm ring-2 ring-inset flex flex-col justify-between ${
          netSavings >= 0 
            ? 'border-indigo-200 ring-indigo-50 bg-white' 
            : 'border-amber-200 ring-amber-50 bg-white'
        }`} id="card-sisa-income">
          <div>
            <p className={`text-xs font-semibold uppercase mb-1 tracking-tight ${netSavings >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>
              Sisa Pendapatan (Bersih)
            </p>
            <h3 className={`text-3xl font-black tracking-tight ${netSavings >= 0 ? 'text-indigo-950' : 'text-amber-900'}`} id="val-sisa-income">
              {formatIDR(netSavings)}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-4 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${netSavings >= 0 ? 'bg-indigo-500' : 'bg-amber-500'}`}></span>
            {netSavings >= 0 ? 'Kondisi surplus finansial aktif' : 'Evaluasi pengeluaran & hilangkan cicilan mahal'}
          </p>
        </div>
      </div>

      {/* Instalment & Loan Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="dashboard-secondary-cards">
        {/* Active Loans Card */}
        <div className="bg-white border border-slate-200 hover:border-indigo-100 transition-all p-4 rounded-xl flex items-center gap-3.5 shadow-sm" id="card-active-loans">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cicilan Aktif</p>
            <h4 className="text-lg font-extrabold text-slate-800" id="val-active-loans">
              {activeLoans.length} Kontrak
            </h4>
            <button 
              id="btn-nav-loans-active"
              onClick={() => onNavigate('loans')} 
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-0.5 transition cursor-pointer"
            >
              Lihat Detail <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Upcoming Due Repayments Card */}
        <div className="bg-white border border-slate-200 hover:border-amber-100 transition-all p-4 rounded-xl flex items-center gap-3.5 shadow-sm" id="card-due-loans">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mendekati Jatuh Tempo</p>
            <h4 className="text-lg font-extrabold text-slate-800" id="val-due-loans">
              {upcomingPayments} Tagihan
            </h4>
            <button 
              id="btn-nav-payments-due"
              onClick={() => onNavigate('payments')} 
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-0.5 transition cursor-pointer"
            >
              Bayar Cicilan <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Settled Loans Card */}
        <div className="bg-white border border-slate-200 hover:border-emerald-100 transition-all p-4 rounded-xl flex items-center gap-3.5 shadow-sm" id="card-settled-loans">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pinjaman Lunas</p>
            <h4 className="text-lg font-extrabold text-slate-800" id="val-settled-loans">
              {finishedLoans.length} Kontrak
            </h4>
            <button 
              id="btn-nav-loans-settled"
              onClick={() => onNavigate('loans')} 
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-0.5 transition cursor-pointer"
            >
              Lihat Riwayat <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Cashflow Chart Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm" id="dashboard-chart-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Grafik Cashflow Bulanan ({selectedYear})</h3>
            <p className="text-xs text-slate-500">Perbandingan pemasukan keseluruhan (Gaji + Lembur) vs pengeluaran terintegrasi.</p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500 block"></span>
              <span className="text-slate-600">Total Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 block"></span>
              <span className="text-slate-600">Total Pengeluaran</span>
            </div>
          </div>
        </div>

        {/* custom responsive visual SVG chart inside a container */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
          <div className="h-80 min-w-[850px] lg:min-w-full relative flex flex-col justify-between" id="dashboard-chart-viewport">
            <svg viewBox="0 0 1200 320" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="40" x2="1160" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="1160" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="160" x2="1160" y2="160" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="220" x2="1160" y2="220" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="280" x2="1160" y2="280" stroke="#f8fafc" strokeWidth="1.5" />

              {/* Data Columns */}
              {monthlyData.map((data, idx) => {
                const xBase = 60 + idx * 92;
                // Scale calculations: height range from y=40 (max) to y=280 (min = zero)
                const chartHeight = 240;
                
                const incHeight = (data.income / maxVal) * chartHeight;
                const expHeight = (data.expense / maxVal) * chartHeight;

                const incY = 280 - incHeight;
                const expY = 280 - expHeight;

                return (
                  <g key={data.bulan} className="group cursor-pointer">
                    {/* Hover highlights */}
                    <rect 
                       x={xBase - 15} 
                       y="15" 
                       width="80" 
                       height="275" 
                       fill="transparent" 
                       className="hover:fill-slate-50/50 transition-colors duration-200"
                    />

                    {/* Bars */}
                    {/* Income Bar */}
                    <rect
                      x={xBase}
                      y={incY}
                      width="22"
                      height={Math.max(incHeight, 2)}
                      rx="3"
                      fill="#84cc16"
                      className="transition-all duration-300 group-hover:brightness-105"
                    />

                    {/* Expense Bar */}
                    <rect
                      x={xBase + 27}
                      y={expY}
                      width="22"
                      height={Math.max(expHeight, 2)}
                      rx="3"
                      fill="#f43f5e"
                      className="transition-all duration-300 group-hover:brightness-105"
                    />

                    {/* Values Tooltip on Hover (simulated in SVG) */}
                    <text
                      x={xBase + 24}
                      y={Math.min(incY, expY) - 10}
                      textAnchor="middle"
                      className="hidden group-hover:block font-sans text-[10px] font-bold fill-slate-700 pointer-events-none"
                    >
                      In: {Math.round(data.income / 1000)}k | Out: {Math.round(data.expense / 1000)}k
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between pl-12 pr-6 mt-1 text-xs font-semibold text-slate-500 font-mono">
              {monthlyData.map((d) => (
                <span key={d.bulan} className="w-[92px] text-center">{d.short}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Bottom row helper panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="dashboard-bottom-panels">
        {/* Quick financial tips / status assessment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="dashboard-insight-panel">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-indigo-500" /> Analisis Kesehatan Finansial
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-start gap-3">
              <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${expensePercentage < 50 ? 'bg-emerald-500' : expensePercentage < 80 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
              <div>
                <p className="text-xs font-semibold text-slate-700">Rasio Pengeluaran terhadap Pendapatan</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Rasio pengeluaran Anda saat ini adalah <span className="font-semibold text-slate-805">{expensePercentage}%</span>. 
                  {expensePercentage < 50 ? ' Rasio ini sangat sehat (di bawah 50%). Anda memiliki sisa dana yang luas untuk investasi atau tabungan.' : 
                   expensePercentage < 80 ? ' Rasio ini tergolong sedang (50% - 80%). Disarankan mulai memotong pengeluaran non-prioritas.' : 
                   ' Rasio ini kritis (di atas 80%). Anda sangat rentan terhadap kedaruratan finansial.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-start gap-3">
              <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${nearDuePayments > 0 ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
              <div>
                <p className="text-xs font-semibold text-slate-700">Status Cicilan &amp; Beban Hutang</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {nearDuePayments > 0 
                    ? `Perhatian! Ada ${nearDuePayments} cicilan yang saat ini mendekati jatuh tempo pembayaran. Selesaikan pembayaran segera.` 
                    : `Semua cicilan bulan ini terjadwal dengan baik. Tidak ada keterlambatan pembayaran hari ini.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Recent Expenses ledger */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm" id="dashboard-recent-expenses">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-3">Pengeluaran Terbaru</h3>
            <div className="divide-y divide-slate-100 font-sans">
              {expenses.slice(0, 4).map((exp) => (
                <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-850">{exp.catatan || 'Pengeluaran Tanpa Catatan'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{exp.tanggal} • {exp.kategori}</p>
                  </div>
                  <span className="font-bold text-rose-600 font-mono">
                    -{formatIDR(exp.nominal)}
                  </span>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-slate-500 text-center py-6">Belum ada pengeluaran dicatat</div>
              )}
            </div>
          </div>
          <button 
            id="btn-nav-expenses-all"
            onClick={() => onNavigate('expenses')}
            className="w-full mt-4 bg-slate-50 hover:bg-slate-100 transition py-2 px-4 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg text-center cursor-pointer"
          >
            Pencatatan Harian Lengkap
          </button>
        </div>
      </div>
    </div>
  );
}
