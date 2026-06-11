import { Income, Loan, LoanPayment, Overtime, Expense } from './types';

export const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const KATEGORI_PENGELUARAN = [
  'Cicilan', 'Transportasi', 'Makan', 'Listrik', 'Internet', 'Belanja', 'Lainnya'
];

export const PLATFORM_PINJAMAN = [
  'Shopee PayLater', 'Kredivo', 'Ceria', 'Dana Cicil', 'GoPay Later', 'Akulaku', 'Bank Transfer', 'Lainnya'
];

export const BOOTSTRAP_INCOMES: Income[] = [
  {
    id: 'inc-1',
    bulan: 'Januari',
    tahun: 2026,
    nominal: 5800000,
    sumber: 'Gaji Pokok',
    keterangan: 'Gaji Bulanan Utama PT Maju Bersama',
    createdAt: '2026-01-25T08:00:00Z'
  },
  {
    id: 'inc-2',
    bulan: 'Februari',
    tahun: 2026,
    nominal: 5800000,
    sumber: 'Gaji Pokok',
    keterangan: 'Gaji Bulanan Utama PT Maju Bersama',
    createdAt: '2026-02-25T08:00:00Z'
  },
  {
    id: 'inc-3',
    bulan: 'Maret',
    tahun: 2026,
    nominal: 5800000,
    sumber: 'Gaji Pokok',
    keterangan: 'Gaji Bulanan Utama PT Maju Bersama',
    createdAt: '2026-03-25T08:00:00Z'
  },
  {
    id: 'inc-4',
    bulan: 'April',
    tahun: 2026,
    nominal: 5800000,
    sumber: 'Gaji Pokok',
    keterangan: 'Gaji Bulanan Utama PT Maju Bersama',
    createdAt: '2026-04-25T08:00:00Z'
  },
  {
    id: 'inc-5',
    bulan: 'Mei',
    tahun: 2026,
    nominal: 5938885,
    sumber: 'Gaji Pokok',
    keterangan: 'Gaji Bulanan Utama PT Maju Bersama + Penyesuaian',
    createdAt: '2026-05-25T08:00:00Z'
  },
  {
    id: 'inc-6',
    bulan: 'Juni',
    tahun: 2026,
    nominal: 5938885,
    sumber: 'Gaji Pokok',
    keterangan: 'Gaji Bulanan Utama PT Maju Bersama',
    createdAt: '2026-06-25T08:00:00Z'
  },
  {
    id: 'inc-7',
    bulan: 'April',
    tahun: 2026,
    nominal: 15400000,
    sumber: 'Bonus Penjualan',
    keterangan: 'Bonus pencapaian target Q1 perusahaan',
    createdAt: '2026-04-20T08:00:00Z'
  }
];

export const BOOTSTRAP_LOANS: Loan[] = [
  {
    id: 'loan-shopee-1',
    nama_pinjaman: 'Shopee 1',
    platform: 'Shopee PayLater',
    nominal_awal: 7133000,
    cicilan_bulanan: 713300,
    tanggal_mulai: '2025-10-10',
    lama_cicilan: 10,
    jatuh_tempo: '2026-08-10',
    status: 'Aktif',
    createdAt: '2025-10-10T12:00:00Z'
  },
  {
    id: 'loan-shopee-2',
    nama_pinjaman: 'Shopee 2',
    platform: 'Shopee PayLater',
    nominal_awal: 3000000,
    cicilan_bulanan: 300000,
    tanggal_mulai: '2025-06-05',
    lama_cicilan: 10,
    jatuh_tempo: '2026-04-05',
    status: 'Lunas',
    createdAt: '2025-06-05T12:00:00Z'
  },
  {
    id: 'loan-kredivo-1',
    nama_pinjaman: 'Kredivo Gadget',
    platform: 'Kredivo',
    nominal_awal: 4500000,
    cicilan_bulanan: 375000,
    tanggal_mulai: '2025-12-15',
    lama_cicilan: 12,
    jatuh_tempo: '2026-12-15',
    status: 'Aktif',
    createdAt: '2025-12-15T12:00:00Z'
  },
  {
    id: 'loan-ceria-1',
    nama_pinjaman: 'Ceria Laptop',
    platform: 'Ceria',
    nominal_awal: 12000000,
    cicilan_bulanan: 1000000,
    tanggal_mulai: '2025-01-01',
    lama_cicilan: 12,
    jatuh_tempo: '2025-12-01',
    status: 'Lunas',
    createdAt: '2025-01-01T12:00:00Z'
  },
  {
    id: 'loan-danacicil-1',
    nama_pinjaman: 'Dana Cicil Darurat',
    platform: 'Dana Cicil',
    nominal_awal: 2400000,
    cicilan_bulanan: 400000,
    tanggal_mulai: '2026-02-12',
    lama_cicilan: 6,
    jatuh_tempo: '2026-08-12',
    status: 'Aktif',
    createdAt: '2026-02-12T12:00:00Z'
  }
];

export const BOOTSTRAP_PAYMENTS: LoanPayment[] = [
  // For Ceria Laptop (12 months - Lunas)
  ...Array.from({ length: 12 }).map((_, index) => ({
    id: `pay-ceria-${index}`,
    loan_id: 'loan-ceria-1',
    bulan_bayar: BULAN_LIST[index % 12],
    nominal: 1000000,
    bukti_bayar: 'receipt_placeholder.png',
    catatan: `Pelunasan cicilan ke-${index + 1}`,
    status: 'Sudah Bayar' as const,
    createdAt: `2025-${String(index + 1).padStart(2, '0')}-02T10:00:00Z`
  })),
  // For Shopee 2 (10 months - Lunas)
  ...Array.from({ length: 10 }).map((_, index) => {
    const monthIndex = (index + 5) % 12; // starts June (index 5)
    const year = index + 5 >= 12 ? 2026 : 2025;
    return {
      id: `pay-shopee2-${index}`,
      loan_id: 'loan-shopee-2',
      bulan_bayar: BULAN_LIST[monthIndex],
      nominal: 300000,
      bukti_bayar: 'receipt_placeholder.png',
      catatan: `Cicilan ke-${index + 1} Shopee 2`,
      status: 'Sudah Bayar' as const,
      createdAt: `${year}-${String(monthIndex + 1).padStart(2, '0')}-04T10:00:00Z`
    };
  }),
  // For Shopee 1 (Starts 2025-10, Active. paid up to May 2026, June is pending/due)
  ...Array.from({ length: 8 }).map((_, index) => {
    const monthIndex = (index + 9) % 12; // starts Oct (index 9)
    const year = index + 9 >= 12 ? 2026 : 2025;
    return {
      id: `pay-shopee1-${index}`,
      loan_id: 'loan-shopee-1',
      bulan_bayar: BULAN_LIST[monthIndex],
      nominal: 713300,
      bukti_bayar: 'receipt_placeholder.png',
      catatan: `Auto-recorded payment for installment ${index + 1}`,
      status: 'Sudah Bayar' as const,
      createdAt: `${year}-${String(monthIndex + 1).padStart(2, '0')}-09T10:00:00Z`
    };
  }),
  // For Kredivo Gadget (Starts 2025-12, paid up to May 2026, June is pending/due)
  ...Array.from({ length: 6 }).map((_, index) => {
    const monthIndex = (index + 11) % 12; // starts Dec (index 11)
    const year = index + 11 >= 12 ? 2026 : 2025;
    return {
      id: `pay-kredivo1-${index}`,
      loan_id: 'loan-kredivo-1',
      bulan_bayar: BULAN_LIST[monthIndex],
      nominal: 375000,
      bukti_bayar: 'receipt_placeholder.png',
      catatan: `Cicilan Kredivo ke-${index + 1}`,
      status: 'Sudah Bayar' as const,
      createdAt: `${year}-${String(monthIndex + 1).padStart(2, '0')}-14T10:00:00Z`
    };
  }),
  // For Dana Cicil (Starts 2026-02, paid up to May 2026)
  ...Array.from({ length: 4 }).map((_, index) => {
    const monthIndex = (index + 1) % 12; // starts Feb (index 1)
    return {
      id: `pay-danacicil1-${index}`,
      loan_id: 'loan-danacicil-1',
      bulan_bayar: BULAN_LIST[monthIndex],
      nominal: 400000,
      bukti_bayar: 'receipt_placeholder.png',
      catatan: `Dana Cicil ke-${index + 1}`,
      status: 'Sudah Bayar' as const,
      createdAt: `2026-${String(monthIndex + 1).padStart(2, '0')}-11T10:00:00Z`
    };
  })
];

export const BOOTSTRAP_OVERTIMES: Overtime[] = [
  {
    id: 'ot-1',
    bulan: 'Mei',
    tahun: 2026,
    jenis: 'Lembur',
    nominal: 1250000,
    keterangan: 'Lembur proyek migrasi database weekend'
  },
  {
    id: 'ot-2',
    bulan: 'Mei',
    tahun: 2026,
    jenis: 'Kompensasi',
    nominal: 450000,
    keterangan: 'Uang transport dinas luar kota'
  },
  {
    id: 'ot-3',
    bulan: 'Juni',
    tahun: 2026,
    jenis: 'Lembur',
    nominal: 850000,
    keterangan: 'Lembur penutupan buku kas tengah tahun'
  }
];

export const BOOTSTRAP_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    tanggal: '2026-01-10',
    kategori: 'Listrik',
    nominal: 450000,
    catatan: 'Token listrik rumah bulanan'
  },
  {
    id: 'exp-2',
    tanggal: '2026-01-12',
    kategori: 'Internet',
    nominal: 350000,
    catatan: 'Tagihan Indihome Wifi'
  },
  {
    id: 'exp-3',
    tanggal: '2026-02-10',
    kategori: 'Listrik',
    nominal: 430000,
    catatan: 'Token listrik'
  },
  {
    id: 'exp-4',
    tanggal: '2026-02-12',
    kategori: 'Internet',
    nominal: 350000,
    catatan: 'Tagihan wifi'
  },
  {
    id: 'exp-5',
    tanggal: '2026-03-05',
    kategori: 'Makan',
    nominal: 1200000,
    catatan: 'Belanja bahan pangan bulanan keluarga'
  },
  {
    id: 'exp-6',
    tanggal: '2026-04-15',
    kategori: 'Belanja',
    nominal: 2500000,
    catatan: 'Kebutuhan sandang persiapan lebaran'
  },
  {
    id: 'exp-7',
    tanggal: '2026-05-18',
    kategori: 'Transportasi',
    nominal: 600000,
    catatan: 'Servis mobil rutin + BBM'
  },
  {
    id: 'exp-8',
    tanggal: '2026-06-02',
    kategori: 'Makan',
    nominal: 950000,
    catatan: 'Bahan masakan & lauk pauk'
  },
  {
    id: 'exp-9',
    tanggal: '2026-06-08',
    kategori: 'Transportasi',
    nominal: 200000,
    catatan: 'E-Toll & Pertamax'
  },
  {
    id: 'exp-10',
    tanggal: '2026-06-11',
    kategori: 'Lainnya',
    nominal: 150000,
    catatan: 'Potong rambut + donasi'
  }
];
