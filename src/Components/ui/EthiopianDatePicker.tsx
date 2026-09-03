import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaExchangeAlt } from 'react-icons/fa';
import { ETHIOPIAN_MONTHS, ethToIsoDateString, toEthiopianDate } from '../../utils/ethiopianCalendar';

interface EthiopianDatePickerProps {
  value: string; // ISO string "YYYY-MM-DD"
  onChange: (isoDate: string) => void;
  label?: string;
  className?: string;
  required?: boolean;
  darkTheme?: boolean;
}

export const EthiopianDatePicker: React.FC<EthiopianDatePickerProps> = ({
  value,
  onChange,
  label = 'Select Date / ቀን ይምረጡ',
  className = '',
  required = false,
  darkTheme = false
}) => {
  const [ethDate, setEthDate] = useState(() => toEthiopianDate(value));
  const [activeMode, setActiveMode] = useState<'gc' | 'ec'>('gc');

  useEffect(() => {
    setEthDate(toEthiopianDate(value));
  }, [value]);

  const handleGcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setEthDate(toEthiopianDate(val));
  };

  const handleEthMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = parseInt(e.target.value, 10);
    const curr = ethDate || { year: 2019, month: 1, day: 1 };
    const iso = ethToIsoDateString(curr.year, m, curr.day);
    onChange(iso);
    setEthDate(toEthiopianDate(iso));
  };

  const handleEthDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let d = parseInt(e.target.value, 10);
    if (isNaN(d)) d = 1;
    d = Math.max(1, Math.min(d, 30));
    const curr = ethDate || { year: 2019, month: 1, day: 1 };
    const iso = ethToIsoDateString(curr.year, curr.month, d);
    onChange(iso);
    setEthDate(toEthiopianDate(iso));
  };

  const handleEthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let y = parseInt(e.target.value, 10);
    if (isNaN(y)) y = 2019;
    const curr = ethDate || { year: 2019, month: 1, day: 1 };
    const iso = ethToIsoDateString(y, curr.month, curr.day);
    onChange(iso);
    setEthDate(toEthiopianDate(iso));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className={`block text-xs font-black uppercase tracking-wider ${darkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
            {label} {required && <span className="text-rose-500">*</span>}
          </label>

          <button
            type="button"
            onClick={() => setActiveMode(prev => prev === 'gc' ? 'ec' : 'gc')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
              darkTheme 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20' 
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <FaExchangeAlt size={9} />
            <span>Mode: {activeMode === 'gc' ? 'Gregorian (GC)' : 'Ethiopian (ዓ.ም)'}</span>
          </button>
        </div>
      )}

      {/* Dual Date Input Fields */}
      {activeMode === 'gc' ? (
        <div className="relative">
          <input
            type="date"
            value={value || ''}
            onChange={handleGcChange}
            required={required}
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold transition-all outline-none ${
              darkTheme 
                ? 'bg-white/5 border-white/15 text-white focus:border-amber-400 focus:bg-white/10' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {/* Ethiopian Month Dropdown */}
          <select
            value={ethDate?.month || 1}
            onChange={handleEthMonthChange}
            className={`px-3 py-3 rounded-2xl border text-xs font-bold outline-none ${
              darkTheme 
                ? 'bg-slate-900 border-white/15 text-white focus:border-amber-400' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
            }`}
          >
            {ETHIOPIAN_MONTHS.map(m => (
              <option key={m.id} value={m.id}>
                {m.amharic} ({m.english})
              </option>
            ))}
          </select>

          {/* Ethiopian Day */}
          <input
            type="number"
            min={1}
            max={30}
            value={ethDate?.day || 1}
            onChange={handleEthDayChange}
            placeholder="Day / ቀን"
            className={`px-3 py-3 rounded-2xl border text-xs font-bold outline-none text-center ${
              darkTheme 
                ? 'bg-white/5 border-white/15 text-white focus:border-amber-400' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
            }`}
          />

          {/* Ethiopian Year */}
          <input
            type="number"
            min={2000}
            max={2100}
            value={ethDate?.year || 2019}
            onChange={handleEthYearChange}
            placeholder="Year / ዓ.ም"
            className={`px-3 py-3 rounded-2xl border text-xs font-bold outline-none text-center ${
              darkTheme 
                ? 'bg-white/5 border-white/15 text-white focus:border-amber-400' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
            }`}
          />
        </div>
      )}

      {/* Live Dual Date Preview Tag */}
      {ethDate && (
        <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
          darkTheme 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <FaCalendarAlt className="text-amber-500 flex-shrink-0" size={13} />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-black text-amber-500">የኢትዮጵያ ቀን:</span>
            <span className="font-bold">{ethDate.formattedAmharic}</span>
            <span className="text-[10px] opacity-75">({ethDate.formattedEnglish})</span>
          </div>
        </div>
      )}
    </div>
  );
};
