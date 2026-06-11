import React, { useState } from 'react';
import { Loan, LoanPayment } from '../types';
import { BULAN_LIST } from '../mockData';
import { 
  Check, 
  X, 
  HelpCircle, 
  Upload, 
  CreditCard, 
  AlertCircle, 
  FileText, 
  Camera, 
  Search,
  CheckCircle,
  FileCheck2
} from 'lucide-react';

interface PaymentsModuleProps {
  payments: LoanPayment[];
  loans: Loan[];
  onUpdatePaymentStatus: (id: string, updated: Partial<LoanPayment>) => void;
}

export default function PaymentsModule({ payments, loans, onUpdatePaymentStatus }: PaymentsModuleProps) {
  const [filterLoanId, setFilterLoanId] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Modal / Log visual payment state
  const [activePayment, setActivePayment] = useState<LoanPayment | null>(null);

  // Form states for activePayment logging
  const [nominalBayar, setNominalBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [buktiBayar, setBuktiBayar] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const handleOpenPayment = (pay: LoanPayment) => {
    setActivePayment(pay);
    setNominalBayar(String(pay.nominal));
    setCatatan(pay.catatan || '');
    setBuktiBayar(pay.bukti_bayar || '');
  };

  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    // Simulate reading file and converting base64
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setBuktiBayar(reader.result as string || 'uploaded_receipt.png');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const submitPaymentLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePayment) return;

    onUpdatePaymentStatus(activePayment.id, {
      nominal: Number(nominalBayar),
      catatan,
      bukti_bayar: buktiBayar || 'receipt_attached.png',
      status: 'Sudah Bayar'
    });

    // Reset Visual Log Trigger
    setActivePayment(null);
  };

  const setAsNearDue = (payId: string) => {
    onUpdatePaymentStatus(payId, {
      status: 'Jatuh Tempo Dekat'
    });
  };

  const setAsUnpaid = (payId: string) => {
    onUpdatePaymentStatus(payId, {
      status: 'Belum Bayar',
      bukti_bayar: ''
    });
  };

  // Filter schedules
  const filteredPayments = payments.filter((pay) => {
    if (filterLoanId !== 'Semua' && pay.loan_id !== filterLoanId) return false;
    if (filterStatus !== 'Semua' && pay.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6" id="payments-module-container">
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pembayaran Cicilan Harian & Bulanan</h2>
          <p className="text-xs text-slate-500">Log pembayaran, simpan bukti kuitansi transfer, dan kelola tengat waktu jatuh tempo.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Loan select */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Filter Pinjaman:</span>
            <select
              id="payment-loan-filter"
              value={filterLoanId}
              onChange={(e) => setFilterLoanId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none hover:border-slate-300 focus:border-indigo-500"
            >
              <option value="Semua">Semua Pinjaman</option>
              {loans.map(l => (
                <option key={l.id} value={l.id}>{l.nama_pinjaman} ({l.platform})</option>
              ))}
            </select>
          </div>

          {/* Status select */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Status:</span>
            <select
              id="payment-status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none hover:border-slate-300 focus:border-indigo-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Belum Bayar">Belum Bayar</option>
              <option value="Sudah Bayar">Sudah Bayar</option>
              <option value="Jatuh Tempo Dekat">Jatuh Tempo Dekat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of payments to reconcile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="payments-grid">
        {filteredPayments.map((pay) => {
          const associatedLoan = loans.find(l => l.id === pay.loan_id);
          if (!associatedLoan) return null;

          return (
            <div 
              key={pay.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition ${
                pay.status === 'Sudah Bayar'
                  ? 'border-emerald-100 bg-emerald-50/5 hover:border-emerald-200'
                  : pay.status === 'Jatuh Tempo Dekat'
                  ? 'border-amber-200 bg-amber-50/5 hover:border-amber-300'
                  : 'border-slate-200 bg-white hover:border-indigo-200'
              }`}
              id={`payment-box-${pay.id}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
                    {associatedLoan.platform}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">{associatedLoan.nama_pinjaman}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Bulan Tagihan: {pay.bulan_bayar}</p>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded font-mono block ${
                    pay.status === 'Sudah Bayar'
                      ? 'bg-emerald-100 text-emerald-800'
                      : pay.status === 'Jatuh Tempo Dekat'
                      ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-400/20'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {pay.status === 'Sudah Bayar' ? 'Sudah Bayar' : pay.status === 'Jatuh Tempo Dekat' ? 'Jatuh Tempo Dekat' : 'Belum Bayar'}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Nominal Tagihan</p>
                  <p className="text-sm font-extrabold text-slate-900 font-mono">{formatIDR(pay.nominal)}</p>
                </div>

                {pay.catatan && (
                  <div className="max-w-[120px] text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Catatan</p>
                    <p className="text-[10px] text-slate-600 italic truncate" title={pay.catatan}>{pay.catatan}</p>
                  </div>
                )}
              </div>

              {/* Uploaded receipt preview if paid */}
              {pay.status === 'Sudah Bayar' && pay.bukti_bayar && (
                <div className="p-2 border border-emerald-100 bg-emerald-50/20 rounded-xl flex items-center gap-2 text-xs">
                  {pay.bukti_bayar.startsWith('data:image/') ? (
                    <img src={pay.bukti_bayar} alt="Bukti kuitansi" className="w-8 h-8 rounded object-cover border border-emerald-200 pointer-events-none" />
                  ) : (
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded select-none">
                      <FileCheck2 className="h-4 w-4" />
                    </div>
                  )}
                  <div className="truncate flex-1">
                    <p className="font-semibold text-emerald-800 text-[10px]">Bukti Transaksi Terlampir</p>
                    <p className="text-[9px] text-emerald-600 font-mono truncate">{pay.bukti_bayar.slice(0, 30)}...</p>
                  </div>
                </div>
              )}

              {/* Quick actions panel */}
              <div className="flex gap-2 pt-1">
                {pay.status !== 'Sudah Bayar' ? (
                  <>
                    <button
                      id={`btn-open-payment-${pay.id}`}
                      onClick={() => handleOpenPayment(pay)}
                      className="flex-1 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl py-2 px-3 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-100"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Konfirmasi Bayar
                    </button>
                    {pay.status !== 'Jatuh Tempo Dekat' && (
                      <button
                        id={`btn-set-neardue-${pay.id}`}
                        onClick={() => setAsNearDue(pay.id)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl py-2 px-2.5 text-xs font-semibold transition cursor-pointer"
                        title="Tandai Dekat Jatuh Tempo"
                      >
                        ⏱️
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    id={`btn-revert-payment-${pay.id}`}
                    onClick={() => {
                      if (confirm('Ubah status ke Belum Bayar dan hapus data transaksi kuitansi?')) {
                        setAsUnpaid(pay.id);
                      }
                    }}
                    className="w-full bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-xl py-2 text-xs font-bold transition cursor-pointer"
                  >
                    Batalkan Log Pembayaran
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredPayments.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl py-12 text-center" id="payments-empty">
            <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 font-medium">Jadwal pembayaran tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* Reconcile Payment Log Overlay Modal */}
      {activePayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="payment-modal">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden p-6 relative">
            <button 
              id="btn-close-payment-modal"
              onClick={() => setActivePayment(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Konfirmasi Setoran Cicilan</h3>
                <p className="text-xs text-slate-500">Mencatat pelunasan tagihan di sistem keuangan SFT.</p>
              </div>
            </div>

            <form onSubmit={submitPaymentLog} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nominal yang Dibayarkan</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono">Rp</span>
                  <input
                    id="modal-payment-nominal"
                    type="number"
                    value={nominalBayar}
                    onChange={(e) => setNominalBayar(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 pl-8 font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Catatan Setoran</label>
                <textarea
                  id="modal-payment-catatan"
                  placeholder="cth. Dibayar lewat Bank Mandiri, Bukti transfer dilampirkan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 outline-none focus:border-indigo-500"
                  rows={2}
                />
              </div>

              {/* Visual Upload Area */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Kuitansi / Bukti Bayar</label>
                <div className="border border-dashed border-slate-300 hover:border-indigo-300 rounded-xl bg-slate-50/50 p-4 min-h-[100px] flex flex-col items-center justify-center text-center cursor-pointer relative transition">
                  <input
                    id="modal-payment-file"
                    type="file"
                    accept="image/*"
                    onChange={handleMockUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {buktiBayar ? (
                    <div className="space-y-2">
                      {buktiBayar.startsWith('data:image/') ? (
                        <img src={buktiBayar} alt="Preview Bukti" className="h-20 max-w-[120px] mx-auto rounded object-cover shadow border pointer-events-none" />
                      ) : (
                        <p className="text-[10px] font-mono text-slate-700 bg-white border px-2 py-1 rounded">Bukti terupload</p>
                      )}
                      <p className="text-[10px] text-slate-500 font-semibold">Klik atau seret untuk mengganti</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-500">
                      <Camera className="h-7 w-7 mx-auto text-slate-400" />
                      <p className="text-[10px] font-semibold">Lampirkan Bukti Pembayaran (Gambar)</p>
                      <p className="text-[9px] text-slate-400">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  id="btn-modal-cancel"
                  type="button"
                  onClick={() => setActivePayment(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-modal-submit"
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Bayar Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
