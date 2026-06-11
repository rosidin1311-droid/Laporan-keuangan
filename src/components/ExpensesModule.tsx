import React, { useState } from 'react';
import { Expense } from '../types';
import { KATEGORI_PENGELUARAN } from '../mockData';
import { 
  Plus, 
  Trash, 
  Wallet, 
  AlertCircle, 
  Calendar, 
  Tag, 
  Sparkles, 
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface ExpensesModuleProps {
  expenses: Expense[];
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpensesModule({ expenses, onAddExpense, onDeleteExpense }: ExpensesModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('Semua');

  // Form Fields
  const [tanggal, setTanggal] = useState('2026-06-11');
  const [kategori, setKategori] = useState<Expense['kategori']>('Makan');
  const [nominal, setNominal] = useState('');
  const [catatan, setCatatan] = useState('');

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || isNaN(Number(nominal)) || Number(nominal) <= 0) {
      alert('Mohon masukkan nominal belanja yang sah!');
      return;
    }

    onAddExpense({
      tanggal,
      kategori,
      nominal: Number(nominal),
      catatan
    });

    // Reset Form
    setNominal('');
    setCatatan('');
    setShowAddForm(false);
  };

  // --- Calculations for breakdown bar ---
  const totalAllExpenses = expenses.reduce((sum, exp) => sum + exp.nominal, 0);

  const categoryTotals = KATEGORI_PENGELUARAN.map(cat => {
    const total = expenses
      .filter(exp => exp.kategori === cat)
      .reduce((sum, exp) => sum + exp.nominal, 0);
    const percentage = totalAllExpenses > 0 ? Math.round((total / totalAllExpenses) * 100) : 0;
    return { name: cat, total, percentage };
  });

  // Filter lists
  const filteredExpenses = expenses.filter(exp => {
    if (filterCategory !== 'Semua' && exp.kategori !== filterCategory) return false;
    return true;
  });

  const totalFilteredExpenseValue = filteredExpenses.reduce((sum, exp) => sum + exp.nominal, 0);

  // Palette generator for categories
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Cicilan': return 'bg-indigo-500 text-indigo-700 hover:bg-indigo-100';
      case 'Transportasi': return 'bg-blue-500 text-blue-700 hover:bg-blue-100';
      case 'Makan': return 'bg-amber-500 text-amber-700 hover:bg-amber-100';
      case 'Listrik': return 'bg-yellow-500 text-yellow-700 hover:bg-yellow-105';
      case 'Internet': return 'bg-teal-500 text-teal-700 hover:bg-teal-100';
      case 'Belanja': return 'bg-rose-500 text-rose-700 hover:bg-rose-100';
      default: return 'bg-slate-500 text-slate-700 hover:bg-slate-100';
    }
  };

  const getCategoryDotColor = (cat: string) => {
    switch (cat) {
      case 'Cicilan': return 'bg-indigo-500';
      case 'Transportasi': return 'bg-blue-500';
      case 'Makan': return 'bg-amber-500';
      case 'Listrik': return 'bg-yellow-400';
      case 'Internet': return 'bg-teal-500';
      case 'Belanja': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6" id="expenses-module-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengeluaran & Belanja Harian</h2>
          <p className="text-xs text-slate-500">Pencatatan kas keluar harian pendukung konsumsi, sarana, bensin, dan operasional.</p>
        </div>

        {/* Action button & filter combo */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Kategori:</span>
            <select
              id="expense-category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none hover:border-slate-300 focus:border-indigo-500"
            >
              <option value="Semua">Semua Kategori</option>
              {KATEGORI_PENGELUARAN.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            id="btn-toggle-add-expense"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-slate-900 transition text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Visual Category Allocation Bar */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4" id="expense-distribution-panel">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase">Alokasi Anggaran Belanja</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Distribusi persentase pengeluaran harian Anda berdasarkan kategori.</p>
        </div>

        {/* Dynamic visual bento progression bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden">
          {categoryTotals.map((cat, i) => {
            if (cat.total === 0) return null;
            return (
              <div
                key={cat.name}
                className={`h-full transition-all duration-300 ${getCategoryDotColor(cat.name)}`}
                style={{ width: `${cat.percentage}%` }}
                title={`${cat.name}: ${cat.percentage}% (${formatIDR(cat.total)})`}
              ></div>
            );
          })}
        </div>

        {/* Interactive Dots list */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {categoryTotals.map(cat => (
            <div key={cat.name} className="flex items-center gap-2 font-medium text-slate-600">
              <span className={`w-2.5 h-2.5 rounded shrink-0 ${getCategoryDotColor(cat.name)}`}></span>
              <div className="truncate">
                <p className="font-bold text-slate-800 text-[10px] uppercase truncate">{cat.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{formatIDR(cat.total)} ({cat.percentage}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adding daily transactions Form */}
      {showAddForm && (
        <form onSubmit={submitAdd} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4" id="form-add-expense">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <TrendingDown className="h-4 w-4 text-rose-500" /> Catat Pengeluaran Baru
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
            {/* Tanggal */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Tanggal Pembayaran</label>
              <input
                id="input-expense-tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                required
              />
            </div>

            {/* Kategori Dropdown */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Kategori Alokasi</label>
              <select
                id="input-expense-kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as Expense['kategori'])}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              >
                {KATEGORI_PENGELUARAN.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Nominal */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Nominal Belanja (Rupiah)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                <input
                  id="input-expense-nominal"
                  type="number"
                  placeholder="150000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full pl-8 rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Catatan / Keterangan Pembelian */}
            <div className="md:col-span-4">
              <label className="block text-slate-600 font-semibold mb-1.5">Catatan Belanja / Invoice Belanja</label>
              <input
                id="input-expense-catatan"
                type="text"
                placeholder="cth. Membeli beras Ramos + minyak goreng kunci mas 2L"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-3 font-sans">
            <button
              id="btn-cancel-expense"
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-submit-expense"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      )}

      {/* Ledger lists Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm font-sans" id="expenses-table-card">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 font-mono text-center">
            Menampilkan {filteredExpenses.length} transaksi belanja harian
          </span>
          <span className="text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full font-mono">
            Total Saringan: {formatIDR(totalFilteredExpenseValue)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="expenses-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4 w-32">Tanggal</th>
                <th className="p-4 w-36">Kategori</th>
                <th className="p-4">Keterangan / Item Belanja</th>
                <th className="p-4 w-40">Nominal</th>
                <th className="p-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="p-4 font-semibold text-slate-700 font-mono">
                    {exp.tanggal}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full font-mono ${
                      exp.kategori === 'Makan' 
                        ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                        : exp.kategori === 'Transportasi' 
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : exp.kategori === 'Cicilan'
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        : exp.kategori === 'Listrik'
                        ? 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                        : exp.kategori === 'Internet'
                        ? 'bg-teal-50 text-teal-600 border border-teal-100'
                        : exp.kategori === 'Belanja'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                    }`}>
                      {exp.kategori}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {exp.catatan || <span className="text-slate-300 italic">Tanpa keterangan...</span>}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    {formatIDR(exp.nominal)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      id={`btn-delete-expense-${exp.id}`}
                      onClick={() => {
                        if (confirm('Hapus rincian belanja ini?')) {
                          onDeleteExpense(exp.id);
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition cursor-pointer"
                      title="Hapus data"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6 text-slate-300" />
                      <p className="text-slate-400 font-medium">Data pengeluaran tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
