import React, { useState } from 'react';
import { Loan, LoanPayment } from '../types';
import { PLATFORM_PINJAMAN, BULAN_LIST } from '../mockData';
import { 
  Plus, 
  Trash, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Check, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';

interface LoansModuleProps {
  loans: Loan[];
  payments: LoanPayment[];
  onAddLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => void;
  onUpdateLoanStatus: (id: string, status: 'Aktif' | 'Lunas') => void;
  onDeleteLoan: (id: string) => void;
}

export default function LoansModule({ loans, payments, onAddLoan, onUpdateLoanStatus, onDeleteLoan }: LoansModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

  // Form Fields
  const [namaPinjaman, setNamaPinjaman] = useState('');
  const [platform, setPlatform] = useState(PLATFORM_PINJAMAN[0]);
  const [nominalAwal, setNominalAwal] = useState('');
  const [cicilanBulanan, setCicilanBulanan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('2026-06-11');
  const [lamaCicilan, setLamaCicilan] = useState('10');
  const [jatuhTempo, setJatuhTempo] = useState('2026-06-11');
  const [status, setStatus] = useState<'Aktif' | 'Lunas'>('Aktif');

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPinjaman || !nominalAwal || !cicilanBulanan || !lamaCicilan) {
      alert('Mohon lengkapi formulir pendaftaran cicilan!');
      return;
    }

    onAddLoan({
      nama_pinjaman: namaPinjaman,
      platform,
      nominal_awal: Number(nominalAwal),
      cicilan_bulanan: Number(cicilanBulanan),
      tanggal_mulai: tanggalMulai,
      lama_cicilan: Number(lamaCicilan),
      jatuh_tempo: jatuhTempo,
      status
    });

    // Reset Form
    setNamaPinjaman('');
    setNominalAwal('');
    setCicilanBulanan('');
    setTanggalMulai('2026-06-11');
    setLamaCicilan('10');
    setJatuhTempo('2026-06-11');
    setStatus('Aktif');
    setShowAddForm(false);
  };

  const toggleExpand = (loanId: string) => {
    if (expandedLoanId === loanId) {
      setExpandedLoanId(null);
    } else {
      setExpandedLoanId(loanId);
    }
  };

  // Autocalculate remaining months and progress ratio
  const getLoanProgress = (loanId: string) => {
    const loanPayments = payments.filter(p => p.loan_id === loanId);
    const paidCount = loanPayments.filter(p => p.status === 'Sudah Bayar').length;
    const totalCount = loanPayments.length || 1;
    const percentage = Math.min(Math.round((paidCount / totalCount) * 100), 100);
    return {
      paidCount,
      totalCount,
      percentage,
      remainingCount: Math.max(totalCount - paidCount, 0)
    };
  };

  return (
    <div className="space-y-6" id="loans-module-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kontrak Pinjaman & Cicilan</h2>
          <p className="text-xs text-slate-500">Mencatat riwayat, sisa kewajiban, tenor, dan jatuh tempo pinjaman luar Anda.</p>
        </div>

        <button
          id="btn-toggle-add-loan"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 transition text-white px-3.5 py-1.5  rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Tambah Pinjaman
        </button>
      </div>

      {/* Add Loan Form */}
      {showAddForm && (
        <form onSubmit={submitAdd} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4" id="form-add-loan">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <Clock className="h-4 w-4 text-indigo-500" /> Pendaftaran Pinjaman Baru
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Nama Pinjaman */}
            <div className="md:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1.5">Nama Pinjaman / Deskripsi</label>
              <input
                id="input-loan-nama"
                type="text"
                placeholder="cth. Shopee iPhone, Kredivo Tas"
                value={namaPinjaman}
                onChange={(e) => setNamaPinjaman(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                required
              />
            </div>

            {/* Platform Dropdown */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Platform Finansial</label>
              <select
                id="input-loan-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              >
                {PLATFORM_PINJAMAN.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Status Pinjaman</label>
              <select
                id="input-loan-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Lunas')}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
              >
                <option value="Aktif">Aktif (Masih Cicil)</option>
                <option value="Lunas">Lunas (Selesai Kontrak)</option>
              </select>
            </div>

            {/* Nominal Awal */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Nominal Kredit (Total Pokok)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                <input
                  id="input-loan-nominal"
                  type="number"
                  placeholder="7133000"
                  value={nominalAwal}
                  onChange={(e) => setNominalAwal(e.target.value)}
                  className="w-full pl-8 rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Cicilan per Bulan */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Cicilan Per Bulan</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                <input
                  id="input-loan-cicilan"
                  type="number"
                  placeholder="713300"
                  value={cicilanBulanan}
                  onChange={(e) => setCicilanBulanan(e.target.value)}
                  className="w-full pl-8 rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Tanggal Mulai */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Tanggal Kontrak Mulai</label>
              <input
                id="input-loan-mulai"
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                required
              />
            </div>

            {/* Tenor / Lama Cicilan */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Tenor (Tenor Bulan)</label>
              <input
                id="input-loan-tenor"
                type="number"
                placeholder="10"
                min="1"
                value={lamaCicilan}
                onChange={(e) => setLamaCicilan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                required
              />
            </div>

            {/* Tanggal Jatuh Tempo */}
            <div className="md:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1.5">Batas Terakhir Jatuh Tempo</label>
              <input
                id="input-loan-jatuh-tempo"
                type="date"
                value={jatuhTempo}
                onChange={(e) => setJatuhTempo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none hover:border-slate-300 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-3">
            <button
              id="btn-cancel-loan"
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-submit-loan"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Simpan Pinjaman & Jadwal
            </button>
          </div>
        </form>
      )}

      {/* Loans Grid/List Accordion card */}
      <div className="space-y-4" id="loans-accordion-container">
        {loans.map((loan) => {
          const isExpanded = expandedLoanId === loan.id;
          const { paidCount, totalCount, percentage, remainingCount } = getLoanProgress(loan.id);

          return (
            <div 
              key={loan.id} 
              className={`bg-white border transition duration-200 rounded-2xl overflow-hidden shadow-sm ${
                isExpanded ? 'border-indigo-400 ring-1 ring-indigo-400/20' : 'border-slate-200/80 hover:border-slate-300'
              }`}
              id={`loan-card-${loan.id}`}
            >
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                onClick={() => toggleExpand(loan.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
                      {loan.platform}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                      loan.status === 'Lunas' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{loan.nama_pinjaman}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Mulai: {loan.tanggal_mulai} • Akhir: {loan.jatuh_tempo}
                  </p>
                </div>

                {/* Tenor / Remaining progress bar */}
                <div className="flex-1 max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-center">Realisasi Tenor:</span>
                    <span className="font-bold text-slate-800 font-mono">{paidCount}/{totalCount} Bulan ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${loan.status === 'Lunas' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Nominal Summary info */}
                <div className="text-left md:text-right space-y-1 min-w-[150px]">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Cicilan Bulanan</p>
                  <p className="text-base font-extrabold text-slate-900 font-mono">{formatIDR(loan.cicilan_bulanan)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Pokok: {formatIDR(loan.nominal_awal)}</p>
                </div>

                {/* Expand Chevron Icon / Actions */}
                <div className="flex items-center gap-3 justify-start md:justify-end">
                  <button
                    id={`btn-toggle-status-loan-${loan.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextStatus = loan.status === 'Aktif' ? 'Lunas' : 'Aktif';
                      if (confirm(`Ubah status kontrak pinjaman menjadi "${nextStatus}"?`)) {
                        onUpdateLoanStatus(loan.id, nextStatus);
                      }
                    }}
                    className={`p-1.5 rounded-lg border transition text-xs font-semibold cursor-pointer ${
                      loan.status === 'Lunas'
                        ? 'bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border-slate-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                    }`}
                    title="Ubah Status Kontrak"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>

                  <button
                    id={`btn-delete-loan-${loan.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Menghapus pinjaman ini akan ikut menghapus riwayat pembayaran terkait. Lanjutkan?')) {
                        onDeleteLoan(loan.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition cursor-pointer"
                    title="Hapus Kontrak"
                  >
                    <Trash className="h-4 w-4" />
                  </button>

                  <div className="p-1.5 rounded-full bg-slate-50 border border-slate-100">
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>
                </div>
              </div>

              {/* Collapsible area showing payment listing */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/40 p-5 space-y-4" id={`loan-expansion-${loan.id}`}>
                  <h5 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="h-4 w-4 text-indigo-500" /> Jadwal Skedul Pembayaran Angsuran
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {payments.filter(p => p.loan_id === loan.id).map((pay, i) => (
                      <div 
                        key={pay.id} 
                        className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">Bulan Ke-{i + 1} ({pay.bulan_bayar})</p>
                          <p className="font-mono text-slate-600 mt-1">{formatIDR(pay.nominal)}</p>
                        </div>

                        <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded font-mono ${
                          pay.status === 'Sudah Bayar'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pay.status === 'Jatuh Tempo Dekat'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pay.status === 'Sudah Bayar' ? 'Lunas' : 'Belum'}
                        </span>
                      </div>
                    ))}

                    {payments.filter(p => p.loan_id === loan.id).length === 0 && (
                      <div className="col-span-full py-2 text-center text-slate-400 italic">
                        Belum ada skedul pembayaran diinisiasi untuk produk ini.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loans.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center" id="loans-empty-card">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700">Daftar Kontrak Pinjaman Kosong</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Tambahkan pinjaman baru di atas untuk menjadwalkan skedul tagihan bulanan Anda secara otomatis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
