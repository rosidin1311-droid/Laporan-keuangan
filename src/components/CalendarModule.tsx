import React, { useState } from 'react';
import { Loan, LoanPayment } from '../types';
import { BULAN_LIST } from '../mockData';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, Info } from 'lucide-react';

interface CalendarModuleProps {
  loans: Loan[];
  payments: LoanPayment[];
}

export default function CalendarModule({ loans, payments }: CalendarModuleProps) {
  // Use June 2026 as starting base, matching the environment local time 2026-06-11.
  const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(5); // June
  const [currentYear, setCurrentYear] = useState<number>(2026);

  const months = BULAN_LIST;
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIdx(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIdx(prev => prev + 1);
    }
  };

  // --- Calendar Date Calculations ---
  // Get first day of week for currentMonth/currentYear
  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1).getDay();
  // Get total days in month
  const totalDaysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  // Create list of days
  const calendarCells = [];
  
  // Fill preceding blank days
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ blank: true, dayNum: 0 });
  }

  // Fill actual dates
  for (let day = 1; day <= totalDaysInMonth; day++) {
    calendarCells.push({ blank: false, dayNum: day });
  }

  // --- Match due dates with loans ---
  // We can look at active loans during this year & month.
  // We can parse 'loan.jatuh_tempo' to find if the day or month aligns.
  // To make it super robust, we match repayment items scheduled for the current selected month!
  const targetMonthName = months[currentMonthIdx];

  const getDayEvents = (dayNum: number) => {
    const events: Array<{ loan: Loan, pay: LoanPayment }> = [];

    payments.forEach(pay => {
      // payment must match current selected month of view
      if (pay.bulan_bayar === targetMonthName) {
        // Find associated loan details
        const loan = loans.find(l => l.id === pay.loan_id);
        if (loan) {
          // Let's determine the target day of month from the loan's jatuh_tempo or start date Day.
          // Let's extract the day part of loan start date or jatuh_tempo date.
          const dateToParse = loan.tanggal_mulai || '2026-06-10';
          const dueDayNum = Number(dateToParse.split('-')[2]) || 10;
          
          if (dueDayNum === dayNum) {
            events.push({ loan, pay });
          }
        }
      }
    });

    return events;
  };

  return (
    <div className="space-y-6" id="calendar-module-container">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Jadwal Kalender Cicilan</h2>
          <p className="text-xs text-slate-500">Visualisasi tanggal batas bayar bulanan semua tagihan pinjaman luar Anda.</p>
        </div>

        {/* Month Selector Carousel */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm self-start">
          <button
            id="btn-calendar-prev"
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <span className="text-sm font-extrabold text-slate-800 font-mono w-32 text-center select-none">
            {months[currentMonthIdx]} {currentYear}
          </span>
          <button
            id="btn-calendar-next"
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Grid Container with responsive scroll wrap */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
        <div className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-sm font-sans min-w-[650px] md:min-w-0" id="calendar-grid-card">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50 text-center text-xs font-bold text-slate-500 py-3 font-mono">
          {daysOfWeek.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[420px] bg-slate-50/20" id="calendar-grid">
          {calendarCells.map((cell, index) => {
            if (cell.blank) {
              return <div key={`blank-${index}`} className="bg-slate-50/30 p-2 border-b border-r border-slate-100"></div>;
            }

            const events = getDayEvents(cell.dayNum);
            const isToday = cell.dayNum === 11 && currentMonthIdx === 5 && currentYear === 2026; // June 11, 2026

            return (
              <div 
                key={`day-${cell.dayNum}`} 
                className={`p-2.5 min-h-[90px] border-b border-r border-slate-100 flex flex-col justify-between transition duration-150 ${
                  isToday 
                    ? 'bg-amber-50/30 ring-1 ring-amber-400/30' 
                    : 'bg-white hover:bg-indigo-50/10'
                }`}
              >
                {/* Date indicator */}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-extrabold font-mono ${
                    isToday 
                      ? 'w-5 h-5 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold shadow shadow-amber-300' 
                      : 'text-slate-400'
                  }`}>
                    {cell.dayNum}
                  </span>
                  
                  {isToday && <span className="text-[8px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Hari ini</span>}
                </div>

                {/* Events listing */}
                <div className="space-y-1.5 mt-2 flex-grow flex flex-col justify-end">
                  {events.map((ev) => (
                    <div 
                      key={ev.pay.id}
                      className={`p-1 rounded text-[9px] font-semibold border truncate max-w-full ${
                        ev.pay.status === 'Sudah Bayar'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 line-through'
                          : ev.pay.status === 'Jatuh Tempo Dekat'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100 font-bold animate-pulse'
                      }`}
                      title={`${ev.loan.nama_pinjaman} (${ev.loan.platform}) Limit: ${ev.loan.status === 'Lunas' ? 'Lunas' : 'Belum Bayar'}`}
                    >
                      📅 {ev.loan.nama_pinjaman}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* Info indicator panel */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3" id="calendar-legend">
        <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 font-semibold text-slate-600">
          <p className="font-bold text-slate-800">Petunjuk Informasi Jatuh Tempo</p>
          <p className="text-slate-500 font-medium">
            Jatuh tempo dihitung otomatis berdasarkan tanggal kontrak pendaftaran cicilan Anda. 
            Modul mencocokkan hari mendaftar dengan bulan anggaran berjalan. 
            Warna <span className="text-emerald-600 font-bold">Hijau</span> menandakan lunas paid, 
            <span className="text-amber-600 font-bold">Kuning</span> mendekati jatuh tempo dekat, dan 
            <span className="text-rose-600 font-bold font-mono">Merah berkedip (Belum Bayar)</span> menandakan tagihan aktif yang harus segera dibereskan.
          </p>
        </div>
      </div>
    </div>
  );
}
