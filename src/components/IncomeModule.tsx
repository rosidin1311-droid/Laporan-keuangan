import React, { useState } from 'react';
import { Income } from '../types';
import { BULAN_LIST } from '../mockData';
import { Plus, Trash, Edit, Calendar, DollarSign, FileText, Check, AlertCircle } from 'lucide-react';

interface IncomeModuleProps {
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  onEditIncome: (id: string, updated: Partial<Income>) => void;
  onDeleteIncome: (id: string) => void;
}

export default function IncomeModule({ incomes, onAddIncome, onEditIncome, onDeleteIncome }: IncomeModuleProps) {
  // State variables
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State
  const [bulan, setBulan] = useState(BULAN_LIST[5]); // Default "Juni"
  const [tahun, setTahun] = useState<number>(2026);
  const [sumber, setSumber] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Editing state fields
  const [editBulan, setEditBulan] = useState('');
  const [editTahun, setEditTahun] = useState<number>(2026);
  const [editSumber, setEditSumber] = useState('');
  const [editNominal, setEditNominal] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');

  // Filter
  const [filterYear, setFilterYear] = useState<string>('Semua');

  // Currency Formatter
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const handleOpenEdit = (inc: Income) => {
    setEditingId(inc.id);
    setEditBulan(inc.bulan);
    setEditTahun(inc.tahun);
    setEditSumber(inc.sumber);
    setEditNominal(String(inc.nominal));
    setEditKeterangan(inc.keterangan);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumber || !nominal || isNaN(Number(nominal)) || Number(nominal) <= 0) {
      alert('Mohon isi sumber pemasukan dan nominal yang valid!');
      return;
    }

    onAddIncome({
      bulan,
      tahun,
      sumber,
      nominal: Number(nominal),
      keterangan
    });

    // Reset Form
    setSumber('');
    setNominal('');
    setKeterangan('');
    setShowAddForm(false);
  };

  const submitEdit = (id: string) => {
    if (!editSumber || !editNominal || isNaN(Number(editNominal)) || Number(editNominal) <= 0) {
      alert('Mohon isi sumber pemasukan dan nominal yang valid!');
      return;
    }

    onEditIncome(id, {
      bulan: editBulan,
      tahun: editTahun,
      sumber: editSumber,
      nominal: Number(editNominal),
      keterangan: editKeterangan
    });

    setEditingId(null);
  };

  // Filter conditions
  const filteredIncomes = incomes.filter(inc => {
    if (filterYear !== 'Semua' && inc.tahun !== Number(filterYear)) return false;
    return true;
  });

  const totalFilteredIncomeValue = filteredIncomes.reduce((sum, inc) => sum + inc.nominal, 0);

  return (
    <div className="space-y-6" id="income-module-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pemasukan Bulanan (Income)</h2>
          <p className="text-xs text-slate-500">Kelola dan catat setiap arus kas masuk / gaji berkala Anda.</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Filter Tahun:</span>
            <select
              id="income-year-filter"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none hover:border-slate-300 focus:border-indigo-500"
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          <button
            id="btn-toggle-add-income"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 transition text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Tambah Income
          </button>
        </div>
      </div>

      {/* Accordion/Form for Adding Income */}
      {showAddForm && (
        <form onSubmit={submitAdd} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4" id="form-add-income">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <DollarSign className="h-4 w-4 text-emerald-500" /> Formulir Pencatatan Pemasukan Baru
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Bulan */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bulan Anggaran</label>
              <select
                id="input-income-bulan"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              >
                {BULAN_LIST.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tahun Anggaran</label>
              <select
                id="input-income-tahun"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            {/* Sumber */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sumber Pemasukan</label>
              <input
                id="input-income-sumber"
                type="text"
                placeholder="cth. Gaji Pokok, Bonus, Side-Hustle"
                value={sumber}
                onChange={(e) => setSumber(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                required
              />
            </div>

            {/* Nominal */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nominal (Rupiah)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">Rp</span>
                <input
                  id="input-income-nominal"
                  type="number"
                  placeholder="5000000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full text-xs pl-8 rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan / Catatan Tambahan</label>
              <textarea
                id="input-income-keterangan"
                rows={1}
                placeholder="Catatan pengerjaan atau detail transaksi..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-3">
            <button
              id="btn-cancel-income"
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-submit-income"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      )}

      {/* Income List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm" id="income-table-card">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 font-mono text-center">
            Menampilkan {filteredIncomes.length} data pemasukan
          </span>
          <span className="text-xs font-extrabold text-slate-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 font-mono">
            Total saringan: {formatIDR(totalFilteredIncomeValue)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="income-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4 w-32">Bulan & Tahun</th>
                <th className="p-4 w-48">Sumber</th>
                <th className="p-4 w-40">Nominal</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredIncomes.map((inc) => {
                const isEditing = editingId === inc.id;

                if (isEditing) {
                  return (
                    <tr key={inc.id} className="bg-indigo-50/30">
                      {/* Edit Fields */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <select
                            value={editBulan}
                            onChange={(e) => setEditBulan(e.target.value)}
                            className="w-full text-xs rounded border border-slate-200 bg-white p-1 outline-none"
                          >
                            {BULAN_LIST.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <select
                            value={editTahun}
                            onChange={(e) => setEditTahun(Number(e.target.value))}
                            className="w-full text-xs rounded border border-slate-200 bg-white p-1 outline-none"
                          >
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                            <option value={2027}>2027</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={editSumber}
                          onChange={(e) => setEditSumber(e.target.value)}
                          className="w-full text-xs rounded border border-slate-200 bg-white p-1"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={editNominal}
                          onChange={(e) => setEditNominal(e.target.value)}
                          className="w-full text-xs rounded border border-slate-200 bg-white p-1 font-mono font-bold text-slate-800"
                        />
                      </td>
                      <td className="p-3">
                        <textarea
                          rows={1}
                          value={editKeterangan}
                          onChange={(e) => setEditKeterangan(e.target.value)}
                          className="w-full text-xs rounded border border-slate-200 bg-white p-1"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => submitEdit(inc.id)}
                            className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded transition cursor-pointer"
                            title="Simpan Perubahan"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition cursor-pointer"
                            title="Batal"
                          >
                            <span className="font-bold text-[10px] px-0.5">X</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={inc.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="p-4 font-semibold text-slate-800">
                      {inc.bulan} {inc.tahun}
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {inc.sumber}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600">
                      {formatIDR(inc.nominal)}
                    </td>
                    <td className="p-4 text-slate-500 italic max-w-xs truncate" title={inc.keterangan}>
                      {inc.keterangan || <span className="text-slate-300">Tanpa keterangan...</span>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded transition cursor-pointer"
                          title="Ubah Data"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus pemasukan "${inc.sumber}" ini?`)) {
                              onDeleteIncome(inc.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredIncomes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6 text-slate-300" />
                      <p className="text-slate-400 font-semibold font-mono text-center">Pemasukan tidak ditemukan</p>
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
