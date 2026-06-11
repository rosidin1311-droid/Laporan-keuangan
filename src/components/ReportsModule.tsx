import React, { useState } from 'react';
import { Income, Loan, LoanPayment, Overtime, Expense } from '../types';
import { BULAN_LIST } from '../mockData';
import { Download, Printer, FileText, CheckCircle, Award, BarChart3, PieChart } from 'lucide-react';

interface ReportsModuleProps {
  incomes: Income[];
  loans: Loan[];
  payments: LoanPayment[];
  overtimes: Overtime[];
  expenses: Expense[];
}

export default function ReportsModule({ incomes, loans, payments, overtimes, expenses }: ReportsModuleProps) {
  const currentYear = 2026;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // --- Compile Monthly Report Sheets ---
  const compiledMonthlyReports = BULAN_LIST.map((bulan, idx) => {
    // 1. Base incomes in this month
    const mIncomes = incomes.filter(i => i.bulan === bulan && i.tahun === selectedYear);
    const mBaseInc = mIncomes.reduce((sum, i) => sum + i.nominal, 0);

    // 2. Extra incomes (Overtime / Compensation) in this month
    const mOvertimes = overtimes.filter(o => o.bulan === bulan && o.tahun === selectedYear);
    const mOt = mOvertimes.reduce((sum, o) => sum + o.nominal, 0);

    const totalIncome = mBaseInc + mOt;

    // 3. Daily Expenses in this month (tanggal is YYYY-MM-DD)
    const monthStr = String(idx + 1).padStart(2, '0');
    const mExpItems = expenses.filter(e => 
      e.tanggal.startsWith(`${selectedYear}-${monthStr}-`) || 
      e.tanggal.includes(`-${monthStr}-`) && e.tanggal.startsWith(String(selectedYear))
    );
    const mDailyExp = mExpItems.reduce((sum, e) => sum + e.nominal, 0);

    // 4. Installments repayments paid in this month
    const mPayments = payments.filter(pay => 
      pay.status === 'Sudah Bayar' && 
      pay.bulan_bayar === bulan && 
      pay.createdAt.startsWith(String(selectedYear))
    );
    const mPayVal = mPayments.reduce((sum, p) => sum + p.nominal, 0);

    const totalExpense = mDailyExp + mPayVal;
    const netSaving = totalIncome - totalExpense;

    return {
      bulan,
      baseIn: mBaseInc,
      extraIn: mOt,
      totalIn: totalIncome,
      harianExp: mDailyExp,
      cicilanExp: mPayVal,
      totalOut: totalExpense,
      sisa: netSaving
    };
  });

  // Calculate annual totals
  const totalAnnualIncome = compiledMonthlyReports.reduce((sum, r) => sum + r.totalIn, 0);
  const totalAnnualExpense = compiledMonthlyReports.reduce((sum, r) => sum + r.totalOut, 0);
  const totalAnnualSavings = totalAnnualIncome - totalAnnualExpense;

  const totalAnnualHarian = compiledMonthlyReports.reduce((sum, r) => sum + r.harianExp, 0);
  const totalAnnualCicilan = compiledMonthlyReports.reduce((sum, r) => sum + r.cicilanExp, 0);

  // --- Export Excel as CSV Function ---
  const handleExportCSV = () => {
    // Build CSV Content
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // UTF-8 BOM representation
    csvContent += 'Smart Finance Tracker (SFT) - Laporan Keuangan Tahunan\r\n';
    csvContent += `Tahun Anggaran; ${selectedYear}\r\n\r\n`;
    
    // Headers
    csvContent += 'Bulan;Pemasukan Gaji (Rp);Pemasukan Lembur & Komp (Rp);Total Income (Rp);Pengeluaran Harian (Rp);Pengeluaran Cicilan (Rp);Total Pengeluaran (Rp);Sisa Pendapatan (Rp)\r\n';

    // Loop
    compiledMonthlyReports.forEach(r => {
      csvContent += `${r.bulan};${r.baseIn};${r.extraIn};${r.totalIn};${r.harianExp};${r.cicilanExp};${r.totalOut};${r.sisa}\r\n`;
    });

    // Totals row
    csvContent += `\r\nTOTAL AKUMULASI;;;${totalAnnualIncome};${totalAnnualHarian};${totalAnnualCicilan};${totalAnnualExpense};${totalAnnualSavings}\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SFT_Laporan_Keuangan_Tahunan_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Print / Save PDF Function ---
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8" id="reports-container">
      {/* Printable Area Wrapper holds print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Rekapitulasi Laporan Finansial</h2>
          <p className="text-xs text-slate-500">Analisis laba-rugi, pembukuan kas bulanan, dan ekspor instrumen akuntansi.</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <select 
            id="report-year-select"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 transition text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4" /> Export Excel
          </button>

          <button
            id="btn-print-pdf"
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 transition text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shadow-sm shadow-indigo-100"
          >
            <Printer className="h-4 w-4" /> Cetak PDF / Laporan
          </button>
        </div>
      </div>

      <div className="space-y-8" id="print-area">
        {/* Printable Invoice Header */}
        <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-indigo-600 tracking-tight">SMART FINANCE TRACKER</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automated Monthly Accounting Protocol Ledger</p>
          </div>
          <div className="text-right font-mono text-xs text-slate-600">
            <p>Tahun Anggaran: <span className="font-bold">{selectedYear}</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">Dibuat otomatis oleh SFT Core Engine</p>
          </div>
        </div>

        {/* Bento grid containing Year aggregates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="reports-statistics-bento">
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="report-card-income">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Income Tahunan</p>
            <h4 className="text-xl font-extrabold text-emerald-600 font-mono mt-1" id="report-val-income">{formatIDR(totalAnnualIncome)}</h4>
            <p className="text-[10px] text-slate-400 mt-1">Gaji Pokok + Lemburan + Kompensasi</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="report-card-expense">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran Tahunan</p>
            <h4 className="text-xl font-extrabold text-rose-600 font-mono mt-1" id="report-val-expense">{formatIDR(totalAnnualExpense)}</h4>
            <p className="text-[10px] text-slate-400 mt-1">Belanja Harian + Cicilan Aktif Paid</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="report-card-savings">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sisa Surplus Bersih</p>
            <h4 className="text-xl font-extrabold text-indigo-600 font-mono mt-1" id="report-val-savings">{formatIDR(totalAnnualSavings)}</h4>
            <p className="text-[10px] text-slate-400 mt-1">Sisa dana cadangan terakumulasi</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="report-card-debt">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Beban Cicilan Terbayar</p>
            <h4 className="text-xl font-extrabold text-slate-800 font-mono mt-1" id="report-val-debt">{formatIDR(totalAnnualCicilan)}</h4>
            <p className="text-[10px] text-slate-400 mt-1">Rasio utang lunas sebesar {totalAnnualExpense > 0 ? Math.round((totalAnnualCicilan / totalAnnualExpense) * 100) : 0}%</p>
          </div>
        </div>

        {/* Monthly table checklist */}
        <div className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-sm" id="reports-table-card">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 font-mono uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-500" /> Lembar Neraca Laba-Rugi Bulanan
            </span>
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              Status: Validated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="reports-table">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider font-sans">
                  <th className="p-4 w-32">Bulan</th>
                  <th className="p-4 w-40 text-right">Income Gaji + Lembur</th>
                  <th className="p-4 w-40 text-right">Pengeluaran Harian</th>
                  <th className="p-4 w-40 text-right">Beban Cicilan</th>
                  <th className="p-4 w-40 text-right">Total Pengeluaran</th>
                  <th className="p-4 w-40 text-right bg-indigo-50/10">Sisa Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {compiledMonthlyReports.map((r) => (
                  <tr key={r.bulan} className="hover:bg-slate-50/20 transition duration-150 font-sans">
                    <td className="p-4 font-bold text-slate-750">
                      {r.bulan}
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-700 text-right">
                      {formatIDR(r.totalIn)}
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-755 text-right">
                      {formatIDR(r.harianExp)}
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-700 text-right">
                      {formatIDR(r.cicilanExp)}
                    </td>
                    <td className="p-4 font-mono font-bold text-rose-600 text-right">
                      {formatIDR(r.totalOut)}
                    </td>
                    <td className={`p-4 font-mono font-bold text-right bg-indigo-50/10 ${r.sisa >= 0 ? 'text-emerald-600' : 'text-rose-600 font-black'}`}>
                      {formatIDR(r.sisa)}
                    </td>
                  </tr>
                ))}

                {/* Aggregation Row */}
                <tr className="bg-slate-50 font-extrabold border-t-2 border-slate-200">
                  <td className="p-4 text-slate-900 font-extrabold">TOTAL TAHUNAN</td>
                  <td className="p-4 font-mono text-emerald-600 text-right">{formatIDR(totalAnnualIncome)}</td>
                  <td className="p-4 font-mono text-slate-700 text-right">{formatIDR(totalAnnualHarian)}</td>
                  <td className="p-4 font-mono text-slate-750 text-right">{formatIDR(totalAnnualCicilan)}</td>
                  <td className="p-4 font-mono text-rose-600 text-right">{formatIDR(totalAnnualExpense)}</td>
                  <td className={`p-4 font-mono text-right bg-indigo-50/20 ${totalAnnualSavings >= 0 ? 'text-indigo-600' : 'text-rose-650'}`}>
                    {formatIDR(totalAnnualSavings)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
