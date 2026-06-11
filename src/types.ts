export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin';
  createdAt: string;
}

export interface Income {
  id: string;
  bulan: string; // "Januari" - "Desember"
  tahun: number;
  nominal: number;
  sumber: string;
  keterangan: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  nama_pinjaman: string;
  platform: string;
  nominal_awal: number;
  cicilan_bulanan: number;
  tanggal_mulai: string; // YYYY-MM-DD
  lama_cicilan: number; // tenor in months
  jatuh_tempo: string; // day of month or date
  status: 'Aktif' | 'Lunas';
  createdAt: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  bulan_bayar: string; // "Januari" - "Desember" (or representative date representation like YYYY-MM)
  nominal: number;
  bukti_bayar: string; // base64 or objectUrl placeholder
  catatan: string;
  status: 'Belum Bayar' | 'Sudah Bayar' | 'Jatuh Tempo Dekat';
  createdAt: string;
}

export interface Overtime {
  id: string;
  bulan: string;
  tahun: number;
  jenis: 'Lembur' | 'Kompensasi';
  nominal: number;
  keterangan: string;
}

export interface Expense {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kategori: 'Cicilan' | 'Transportasi' | 'Makan' | 'Listrik' | 'Internet' | 'Belanja' | 'Lainnya';
  nominal: number;
  catatan: string;
}
