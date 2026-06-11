import React, { useState } from 'react';
import { Overtime } from '../types';
import { BULAN_LIST } from '../mockData';
import { 
  Plus, 
  Trash, 
  Coins, 
  HelpCircle, 
  Briefcase, 
  AlertCircle 
} from 'lucide-react';

interface OvertimeModuleProps {
  overtimes: Overtime[];
  onAddOvertime: (ot: Omit<Overtime, 'id'>) => void;
  onDeleteOvertime: (id: string) => void;
}

export default function OvertimeModule({ overtimes, onAddOvertime, onDeleteOvertime }: OvertimeModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [bulan, setBulan] = useState(BULAN_LIST[5]); // default "Juni"
  const [tahun, setTahun] = useState<number>(2026);
  const [jenis, setJenis] = useState<'Lembur' | 'Kompensasi'>('Lembur');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

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
      alert('Mohon masukkan nominal yang valid!');
      return;
    }

    onAddOvertime({
      bulan,
      tahun,
      jenis,
      nominal: Number(nominal),
      keterangan
    });

    // Reset Form
    setNominal('');
    setKeterangan('');
    setShowAddForm(false);
  };

  // --- Monthly statistics based on current filter or defaults (Let's check current active month "Juni 2026") ---
  const activeBulan = BULAN_LIST[5]; // Juni
  const activeTahun = 2026;

  const currentMonthOvertimes = overtimes.filter(o => o.bulan === activeBulan && o.tahun === activeTahun);
  
  const totalLemburBulanIni = currentMonthOvertimes
    .filter(o => o.jenis === 'Lembur')
    .reduce((sum, o) => sum + o.nominal, 0);

  const totalKompensasiBulanIni = currentMonthOvertimes
    .filter(o => o.jenis === 'Kompensasi')
    .reduce((sum, o) => sum + o.nominal, 0);

  const totalBulanIni = totalLemburBulanIni + totalKompensasiBulanIni;

  // Total Keseluruhan (All records across all months)
  const totalLemburAll = overtimes.filter(o => o.jenis === 'Lembur').reduce((sum, o) => sum + o.nominal, 0);
  const totalKompensasiAll = overtimes.filter(o => o.jenis === 'Kompensasi').reduce((sum, o) => sum + o.nominal, 0);
  const totalOverallValue = totalLemburAll + totalKompensasiAll;

  return (
    <div className="space-y-6" id="overtime-module-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Modul Lemburan & Kompensasi</h2>
          <p className="text-xs text-slate-500">Mencatat pendapatan tambahan atas lembur kerja atau dana transport dinas.</p>
        </div>

        <button
          id="btn-toggle-add-ot"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-slate-900 transition text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Tambah Lemburan
        </button>
      </div>

      {/* Recap Statistics Header Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="overtime-recap">
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="ot-card-thismonth-lembur">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Lemburan Bulan Ini ({activeBulan})</p>
          <h4 className="text-xl font-bold text-slate-800 font-mono mt-1" id="val-ot-thismonth-lembur">
            {formatIDR(totalLemburBulanIni)}
          </h4>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="ot-card-thismonth-comp">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Kompensasi Bulan Ini ({activeBulan})</p>
          <h4 className="text-xl font-bold text-slate-800 font-mono mt-1" id="val-ot-thismonth-comp">
            {formatIDR(totalKompensasiBulanIni)}
          </h4>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="ot-card-total">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Akumulasi Total Lembur & Kompensasi</p>
          <h4 className="text-xl font-extrabold text-indigo-600 font-mono mt-1" id="val-ot-total">
            {formatIDR(totalOverallValue)}
          </h4>
        </div>
      </div>

      {/* Add Overtime Form */}
      {showAddForm && (
        <form onSubmit={submitAdd} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4" id="form-add-ot">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <Coins className="h-4 w-4 text-emerald-500" /> Formulir Tambah Data Lemburan / Kompensasi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
            {/* Bulan */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Bulan Terkait</label>
              <select
                id="input-ot-bulan"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              >
                {BULAN_LIST.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Tahun Terkait</label>
              <select
                id="input-ot-tahun"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            {/* Jenis */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Jenis Pendapatan</label>
              <select
                id="input-ot-jenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value as 'Lembur' | 'Kompensasi')}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              >
                <option value="Lembur">Lembur Kerja (Overtime)</option>
                <option value="Kompensasi">Kompensasi Mandiri (Uang Dinas/Bensin)</option>
              </select>
            </div>

            {/* Nominal */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Nominal Tambahan (Rupiah)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                <input
                  id="input-ot-nominal"
                  type="number"
                  placeholder="300000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full pl-8 rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="md:col-span-4">
              <label className="block text-slate-600 font-semibold mb-1.5">Keterangan / Detil Proyek Lapangan</label>
              <input
                id="input-ot-keterangan"
                type="text"
                placeholder="cth. Lembur migrasi database modul kuitansi"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-3">
            <button
              id="btn-cancel-ot"
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-submit-ot"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Simpan Data
            </button>
          </div>
        </form>
      )}

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm" id="overtime-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="overtime-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4 w-32">Bulan & Tahun</th>
                <th className="p-4 w-40">Jenis</th>
                <th className="p-4 w-40">Nominal</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {overtimes.map((ot) => (
                <tr key={ot.id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="p-4 font-semibold text-slate-800">
                    {ot.bulan} {ot.tahun}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                      ot.jenis === 'Lembur' 
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {ot.jenis}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-800">
                    {formatIDR(ot.nominal)}
                  </td>
                  <td className="p-4 text-slate-600 italic">
                    {ot.keterangan || <span className="text-slate-300">Tanpa keterangan...</span>}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      id={`btn-delete-ot-${ot.id}`}
                      onClick={() => {
                        if (confirm('Hapus lemburan/kompensasi ini?')) {
                          onDeleteOvertime(ot.id);
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

              {overtimes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-6 w-6 text-slate-300" />
                      <p className="text-slate-400 font-medium">Buku lemburan & kompensasi masih kosong</p>
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
