import React, { useState, useEffect } from 'react';
import { 
  Income, 
  Loan, 
  LoanPayment, 
  Overtime, 
  Expense,
  User
} from './types';
import { 
  BOOTSTRAP_INCOMES, 
  BOOTSTRAP_LOANS, 
  BOOTSTRAP_PAYMENTS, 
  BOOTSTRAP_OVERTIMES, 
  BOOTSTRAP_EXPENSES,
  BULAN_LIST
} from './mockData';

// Component imports
import Dashboard from './components/Dashboard';
import IncomeModule from './components/IncomeModule';
import LoansModule from './components/LoansModule';
import PaymentsModule from './components/PaymentsModule';
import OvertimeModule from './components/OvertimeModule';
import ExpensesModule from './components/ExpensesModule';
import CalendarModule from './components/CalendarModule';
import ReportsModule from './components/ReportsModule';

// Icons
import { 
  Building2, 
  TrendingUp, 
  FileCheck2, 
  Layers, 
  Calendar as CalendarIcon, 
  DollarSign, 
  FileText, 
  LayoutDashboard,
  Shield, 
  RefreshCw, 
  Download, 
  Upload, 
  Coins,
  Receipt,
  User as UserIcon,
  PiggyBank,
  Menu,
  X,
  MoreHorizontal
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);

  // --- Active Admin Profile/Session Mimic ---
  const currentUser: User = {
    id: 'u-admin-1',
    name: 'Rosidin',
    email: 'rosidin1311@gmail.com',
    role: 'Admin',
    createdAt: '2026-01-01T00:00:00Z'
  };

  // --- Initialize States from localStorage with Bootstrapped Defaults ---
  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('sft_incomes');
    return saved ? JSON.parse(saved) : BOOTSTRAP_INCOMES;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('sft_loans');
    return saved ? JSON.parse(saved) : BOOTSTRAP_LOANS;
  });

  const [payments, setPayments] = useState<LoanPayment[]>(() => {
    const saved = localStorage.getItem('sft_payments');
    return saved ? JSON.parse(saved) : BOOTSTRAP_PAYMENTS;
  });

  const [overtimes, setOvertimes] = useState<Overtime[]>(() => {
    const saved = localStorage.getItem('sft_overtimes');
    return saved ? JSON.parse(saved) : BOOTSTRAP_OVERTIMES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('sft_expenses');
    return saved ? JSON.parse(saved) : BOOTSTRAP_EXPENSES;
  });

  // --- Sync with localStorage on Every State Update ---
  useEffect(() => {
    localStorage.setItem('sft_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('sft_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('sft_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('sft_overtimes', JSON.stringify(overtimes));
  }, [overtimes]);

  useEffect(() => {
    localStorage.setItem('sft_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // --- State Manipulation Handlers ---

  // 1. Income CRUD handlers
  const handleAddIncome = (newIncome: Omit<Income, 'id' | 'createdAt'>) => {
    const item: Income = {
      ...newIncome,
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    setIncomes(prev => [item, ...prev]);
  };

  const handleEditIncome = (id: string, updated: Partial<Income>) => {
    setIncomes(prev => prev.map(inc => inc.id === id ? { ...inc, ...updated } : inc));
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(inc => inc.id !== id));
  };

  // 2. Loans & Installment Generation
  const handleAddLoan = (newLoan: Omit<Loan, 'id' | 'createdAt'>) => {
    const loanId = `loan-${Date.now()}`;
    const loanItem: Loan = {
      ...newLoan,
      id: loanId,
      createdAt: new Date().toISOString()
    };

    // Auto-generate schedules of payments
    // Starts parsing the starting date
    const startDayNumeric = new Date(newLoan.tanggal_mulai);
    const startMonthIndex = startDayNumeric.getMonth(); // 0 to 11
    const startYearNumeric = startDayNumeric.getFullYear();

    const generatedSchedules: LoanPayment[] = [];

    for (let index = 0; index < newLoan.lama_cicilan; index++) {
      const monthIdx = (startMonthIndex + index) % 12;
      const yearIdx = startYearNumeric + Math.floor((startMonthIndex + index) / 12);
      
      generatedSchedules.push({
        id: `pay-${loanId}-${index}`,
        loan_id: loanId,
        bulan_bayar: BULAN_LIST[monthIdx],
        nominal: newLoan.cicilan_bulanan,
        bukti_bayar: '',
        catatan: `Generated schedule for installment slot ${index + 1}`,
        status: 'Belum Bayar',
        createdAt: `${yearIdx}-${String(monthIdx + 1).padStart(2, '0')}-${String(startDayNumeric.getDate()).padStart(2, '0')}T12:00:00Z`
      });
    }

    setLoans(prev => [loanItem, ...prev]);
    setPayments(prev => [...generatedSchedules, ...prev]);
  };

  const handleUpdateLoanStatus = (id: string, status: 'Aktif' | 'Lunas') => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleDeleteLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    // Clear associated schedules
    setPayments(prev => prev.filter(p => p.loan_id !== id));
  };

  // 3. Payments
  const handleUpdatePaymentStatus = (id: string, updated: Partial<LoanPayment>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  // 4. Overtime
  const handleAddOvertime = (newOt: Omit<Overtime, 'id'>) => {
    const item: Overtime = {
      ...newOt,
      id: `ot-${Date.now()}`
    };
    setOvertimes(prev => [item, ...prev]);
  };

  const handleDeleteOvertime = (id: string) => {
    setOvertimes(prev => prev.filter(o => o.id !== id));
  };

  // 5. Daily Expenses
  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const item: Expense = {
      ...newExp,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [item, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // 6. Reset visual database trigger
  const handleResetDatabase = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang database keuangan Anda kembali ke data bawaan simulasi? Semua input kustom Anda akan terhapus.')) {
      setIncomes(BOOTSTRAP_INCOMES);
      setLoans(BOOTSTRAP_LOANS);
      setPayments(BOOTSTRAP_PAYMENTS);
      setOvertimes(BOOTSTRAP_OVERTIMES);
      setExpenses(BOOTSTRAP_EXPENSES);
      setActiveTab('dashboard');
      alert('Database Smart Finance Tracker (SFT) berhasil dikonfigurasi ulang ke data standar!');
    }
  };

  // 7. Backup and Restore operations
  const handleBackupData = () => {
    const payload = {
      incomes,
      loans,
      payments,
      overtimes,
      expenses
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'SFT_Smart_Finance_Tracker_Backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const handleRestoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const restored = JSON.parse(event.target?.result as string);
        if (restored.incomes && restored.loans && restored.payments) {
          setIncomes(restored.incomes);
          setLoans(restored.loans);
          setPayments(restored.payments);
          if (restored.overtimes) setOvertimes(restored.overtimes);
          if (restored.expenses) setExpenses(restored.expenses);
          alert('Migrasi & Pemulihan Database Berhasil!');
        } else {
          alert('Format berkas tidak cocok dengan format administrasi SFT.');
        }
      } catch (err) {
        alert('Gagal mendengarkan berkas cadangan JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased" id="root-viewport">
      {/* Upper Navigation Header bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 no-print" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-650 flex items-center justify-center text-white shadow shadow-indigo-200 bg-indigo-600">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight block">Smart Finance Tracker</span>
              <span className="text-[10px] text-indigo-600 font-bold tracking-widest font-mono uppercase">SFT Indonesia</span>
            </div>
          </div>

          {/* User Session profile dropdown / Backup triggers */}
          <div className="flex items-center gap-4 relative">
            {/* Backup/Sync Status Bar */}
            <div className="hidden md:flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1 text-[10px] font-bold text-slate-500 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 block animate-pulse"></span>
              <span>Lokal Aktif (Auto-Sync)</span>
            </div>

            {/* Admin control panel picker */}
            <div className="relative">
              <button
                id="btn-profile-dropdown"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-slate-50 border border-slate-100 transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-150 flex items-center justify-center text-indigo-700 bg-indigo-100 font-bold text-xs select-none">
                  {currentUser.name[0]}
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:block">{currentUser.name}</span>
                <span className="text-[9px] font-bold uppercase py-0.5 px-1.5 rounded bg-indigo-50 text-indigo-600">{currentUser.role}</span>
              </button>

              {/* Profile sub dropdown controls */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-2xl w-56 shadow-xl py-2 z-50 text-xs font-semibold" id="profile-dropdown-box">
                  <div className="p-3 border-b border-slate-100 text-slate-500">
                    <p className="font-bold text-slate-700">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{currentUser.email}</p>
                  </div>

                  {/* Actions list */}
                  <button
                    id="btn-menu-backup"
                    onClick={() => { handleBackupData(); setShowProfileDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-slate-400" /> Export Backup (.json)
                  </button>

                  <label className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span>Import Backup (.json)</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={(e) => { handleRestoreData(e); setShowProfileDropdown(false); }} 
                      className="hidden" 
                    />
                  </label>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      id="btn-menu-reset"
                      onClick={() => { handleResetDatabase(); setShowProfileDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4 text-rose-400" /> Reset Database Bawaan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Structural Body View Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col md:flex-row gap-8 pt-8 pb-24 md:py-8 w-full" id="main-content-layout">
        
        {/* Sidebar Left Navigation Panel (Hidden on mobile, block on Desktop) */}
        <aside className="hidden md:block w-full md:w-64 shrink-0 space-y-4 no-print" id="sidebar">
          {/* Main system menu */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg text-slate-300" id="nav-group-menu">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-3 block mb-3 font-mono">UTAMA</span>
            <nav className="space-y-1" id="nav-list">
              {/* Dashboard */}
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/50 border-r-4 border-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" /> Dashboard
              </button>

              {/* Income */}
              <button
                id="tab-income"
                onClick={() => setActiveTab('income')}
                className={`w-full text-left flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === 'income' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/50 border-r-4 border-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <TrendingUp className="h-4 w-4 shrink-0" /> Pemasukan (Income)
              </button>

              {/* Loans */}
              <button
                id="tab-loans"
                onClick={() => setActiveTab('loans')}
                className={`w-full text-left flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === 'loans' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/50 border-r-4 border-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0" /> Kontrak Pinjaman
              </button>

              {/* Payments */}
              <button
                id="tab-payments"
                onClick={() => setActiveTab('payments')}
                className={`w-full text-left flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === 'payments' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/50 border-r-4 border-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" /> Bayar Cicilan
              </button>

              {/* Overtime */}
              <button
                id="tab-overtime"
                onClick={() => setActiveTab('overtime')}
                className={`w-full text-left flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === 'overtime' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/50 border-r-4 border-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Coins className="h-4 w-4 shrink-0" /> Lemburan & Kompensasi
              </button>

              {/* Expenses */}
              <button
                id="tab-expenses"
                onClick={() => setActiveTab('expenses')}
                className={`w-full text-left flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === 'expenses' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/50 border-r-4 border-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Receipt className="h-4 w-4 shrink-0" /> Pengeluaran Harian
              </button>

              {/* Calendar */}
              <button
                id="tab-calendar"
                onClick={() => setActiveTab('calendar')}
                className={`w-full text-left flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === 'calendar' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/50 border-r-4 border-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CalendarIcon className="h-4 w-4 shrink-0" /> Kalender Cicilan
              </button>

              {/* Reports */}
              <button
                id="tab-reports"
                onClick={() => setActiveTab('reports')}
                className={`w-full text-left flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === 'reports' 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-900/50 border-r-4 border-indigo-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" /> Laporan & Pembukuan
              </button>
            </nav>
          </div>

          {/* Quick status help widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-md hidden md:block" id="sidebar-help-panel">
            <h4 className="font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider text-indigo-400">
              <Shield className="h-3.5 w-3.5 text-indigo-400" /> Keamanan Rekening
            </h4>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Seluruh rincian pemasukan dan data kredit pribadi SFT dienkripsi lokal dalam peramban sandbox Anda secara privat. SFT tidak pernah mengirim data Anda ke server luar.
            </p>
          </div>
        </aside>

        {/* Dynamic Center Work Stage Component */}
        <main className="flex-grow min-w-0" id="stage">
          {activeTab === 'dashboard' && (
            <Dashboard 
              incomes={incomes}
              loans={loans}
              payments={payments}
              overtimes={overtimes}
              expenses={expenses}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'income' && (
            <IncomeModule
              incomes={incomes}
              onAddIncome={handleAddIncome}
              onEditIncome={handleEditIncome}
              onDeleteIncome={handleDeleteIncome}
            />
          )}

          {activeTab === 'loans' && (
            <LoansModule
              loans={loans}
              payments={payments}
              onAddLoan={handleAddLoan}
              onUpdateLoanStatus={handleUpdateLoanStatus}
              onDeleteLoan={handleDeleteLoan}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsModule
              payments={payments}
              loans={loans}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          )}

          {activeTab === 'overtime' && (
            <OvertimeModule
              overtimes={overtimes}
              onAddOvertime={handleAddOvertime}
              onDeleteOvertime={handleDeleteOvertime}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesModule
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarModule
              loans={loans}
              payments={payments}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsModule
              incomes={incomes}
              loans={loans}
              payments={payments}
              overtimes={overtimes}
              expenses={expenses}
            />
          )}
        </main>
      </div>

      {/* Main Footer layout */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 text-center text-[10px] text-slate-400 font-medium no-print" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© 2026 Smart Finance Tracker Indonesia (SFT Core v1.4.2). Dipasok untuk verifikasi standar akuntansi audit pribadi.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Visible only on screens < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-400 z-40 flex items-center justify-around py-2 px-2 pb-safe shadow-xl select-none" id="mobile-bottom-nav">
        {/* Dashboard */}
        <button
          onClick={() => { setActiveTab('dashboard'); setShowMobileDrawer(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="h-4.5 w-4.5 mb-1" />
          <span>Dashboard</span>
        </button>

        {/* Income */}
        <button
          onClick={() => { setActiveTab('income'); setShowMobileDrawer(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
            activeTab === 'income' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="h-4.5 w-4.5 mb-1" />
          <span>Income</span>
        </button>

        {/* Expenses */}
        <button
          onClick={() => { setActiveTab('expenses'); setShowMobileDrawer(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
            activeTab === 'expenses' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="h-4.5 w-4.5 mb-1" />
          <span>Expenses</span>
        </button>

        {/* Payments/Cicilan */}
        <button
          onClick={() => { setActiveTab('payments'); setShowMobileDrawer(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
            activeTab === 'payments' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4.5 w-4.5 mb-1" />
          <span>Cicilan</span>
        </button>

        {/* More Menu */}
        <button
          onClick={() => setShowMobileDrawer(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
            showMobileDrawer ? 'text-indigo-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="h-4.5 w-4.5 mb-1" />
          <span>Lainnya</span>
        </button>
      </div>

      {/* Mobile Menu Drawer Bottom Sheet / Full-Screen Overlay */}
      {showMobileDrawer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-end md:hidden" id="mobile-drawer-overlay">
          {/* Backdrop Touch Dismiss */}
          <div className="absolute inset-0 -z-10" onClick={() => setShowMobileDrawer(false)}></div>
          
          <div className="bg-slate-900 text-white rounded-t-3xl border-t border-slate-800 p-6 space-y-6 max-h-[85vh] overflow-y-auto pb-24 shadow-2xl" id="mobile-drawer-container">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center font-bold text-sm">S</div>
                <h3 className="font-extrabold text-sm tracking-tight text-white">Menu Finansial SFT</h3>
              </div>
              <button 
                onClick={() => setShowMobileDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User Session Profile Mini */}
            <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                  {currentUser.name[0]}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-100">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase py-0.5 px-2 rounded bg-indigo-900 text-indigo-300">
                {currentUser.role}
              </span>
            </div>

            {/* Menu Sections Grid */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Daftar Modul Keuangan</span>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Dashboard */}
                <button
                  onClick={() => { setActiveTab('dashboard'); setShowMobileDrawer(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold border ${
                    activeTab === 'dashboard' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-950' 
                      : 'bg-slate-800/50 border-slate-850 border-slate-850/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Dashboard</span>
                </button>

                {/* Income */}
                <button
                  onClick={() => { setActiveTab('income'); setShowMobileDrawer(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold border ${
                    activeTab === 'income' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-950' 
                      : 'bg-slate-800/50 border-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Pemasukan</span>
                </button>

                {/* Kontrak Pinjaman */}
                <button
                  onClick={() => { setActiveTab('loans'); setShowMobileDrawer(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold border ${
                    activeTab === 'loans' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-950' 
                      : 'bg-slate-800/50 border-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="truncate">Pinjaman</span>
                </button>

                {/* Bayar Cicilan */}
                <button
                  onClick={() => { setActiveTab('payments'); setShowMobileDrawer(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold border ${
                    activeTab === 'payments' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-950' 
                      : 'bg-slate-800/50 border-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Bayar Cicilan</span>
                </button>

                {/* Lemburan */}
                <button
                  onClick={() => { setActiveTab('overtime'); setShowMobileDrawer(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold border ${
                    activeTab === 'overtime' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-950' 
                      : 'bg-slate-800/50 border-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Coins className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="truncate">Lemburan</span>
                </button>

                {/* Pengeluaran */}
                <button
                  onClick={() => { setActiveTab('expenses'); setShowMobileDrawer(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold border ${
                    activeTab === 'expenses' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-950' 
                      : 'bg-slate-800/50 border-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Receipt className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Pengeluaran</span>
                </button>

                {/* Kalender */}
                <button
                  onClick={() => { setActiveTab('calendar'); setShowMobileDrawer(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold border ${
                    activeTab === 'calendar' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-950' 
                      : 'bg-slate-800/50 border-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Kalender</span>
                </button>

                {/* Laporan */}
                <button
                  onClick={() => { setActiveTab('reports'); setShowMobileDrawer(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold border ${
                    activeTab === 'reports' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-950' 
                      : 'bg-slate-800/50 border-slate-850 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Laporan SFT</span>
                </button>
              </div>
            </div>

            {/* System Utilities Section */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Cadangan &amp; Administrasi</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { handleBackupData(); setShowMobileDrawer(false); }}
                  className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-slate-400 z-10" /> Ekspor Backup (.json)
                </button>

                <label className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span>Impor Backup (.json)</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={(e) => { handleRestoreData(e); setShowMobileDrawer(false); }} 
                    className="hidden" 
                  />
                </label>

                <button
                  onClick={() => { handleResetDatabase(); setShowMobileDrawer(false); }}
                  className="w-full bg-rose-950/40 text-rose-450 hover:bg-rose-950/60 border border-rose-900/60 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 mt-1 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 text-rose-400" /> Setel Ulang Data Bawaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
