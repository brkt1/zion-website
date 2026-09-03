/**
 * Utility for converting between Gregorian Calendar (GC) and Ethiopian Calendar (EC / ዓ.ም)
 */

export interface EthiopianDate {
  year: number;
  month: number; // 1 to 13
  day: number;   // 1 to 30 (or 1 to 5/6 for Pagume)
  monthNameAmharic: string;
  monthNameEnglish: string;
  formattedAmharic: string; // e.g. "መስከረም 04, 2019 ዓ.ም"
  formattedEnglish: string; // e.g. "Meskerem 04, 2019 E.C."
  fullFormatted: string;    // e.g. "መስከረም 04, 2019 ዓ.ም (Meskerem 04, 2019 E.C.)"
}

export const ETHIOPIAN_MONTHS = [
  { id: 1, amharic: 'መስከረም', english: 'Meskerem' },
  { id: 2, amharic: 'ጥቅምት', english: 'Tikimt' },
  { id: 3, amharic: 'ህዳር', english: 'Hidar' },
  { id: 4, amharic: 'ታኅሣሥ', english: 'Tahsas' },
  { id: 5, amharic: 'ጥር', english: 'Tir' },
  { id: 6, amharic: 'የካቲት', english: 'Yekatit' },
  { id: 7, amharic: 'መጋቢት', english: 'Megabit' },
  { id: 8, amharic: 'ሚያዝያ', english: 'Miazia' },
  { id: 9, amharic: 'ግንቦት', english: 'Ginbot' },
  { id: 10, amharic: 'ሰኔ', english: 'Sene' },
  { id: 11, amharic: 'ሐምሌ', english: 'Hamle' },
  { id: 12, amharic: 'ነሐሴ', english: 'Nahase' },
  { id: 13, amharic: 'ጳጉሜ', english: 'Pagume' },
];

/**
 * Convert Gregorian Date to Ethiopian Date
 */
export function toEthiopianDate(gregorianDate: Date | string | number | null | undefined): EthiopianDate | null {
  if (!gregorianDate) return null;
  const date = typeof gregorianDate === 'string' || typeof gregorianDate === 'number' 
    ? new Date(gregorianDate) 
    : gregorianDate;
  
  if (isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Ethiopian New Year in September (Sept 11 or Sept 12 before GC leap year)
  const newYearDay = (year % 4 === 3) ? 12 : 11;

  let ethYear = year - 8;
  if (month > 9 || (month === 9 && day >= newYearDay)) {
    ethYear = year - 7;
  }

  // Calculate day offset from Ethiopian New Year
  const ethNewYear = new Date(year, 8, newYearDay); // Sept is month 8 in 0-indexed JS Date
  let dayOffset: number;

  if (date >= ethNewYear) {
    dayOffset = Math.floor((date.getTime() - ethNewYear.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    const prevYear = year - 1;
    const prevNewYearDay = (prevYear % 4 === 3) ? 12 : 11;
    const prevEthNewYear = new Date(prevYear, 8, prevNewYearDay);
    dayOffset = Math.floor((date.getTime() - prevEthNewYear.getTime()) / (1000 * 60 * 60 * 24));
  }

  const ethMonth = Math.min(Math.floor(dayOffset / 30) + 1, 13);
  const ethDay = (dayOffset % 30) + 1;

  const monthInfo = ETHIOPIAN_MONTHS[ethMonth - 1] || ETHIOPIAN_MONTHS[0];
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthNameAmharic: monthInfo.amharic,
    monthNameEnglish: monthInfo.english,
    formattedAmharic: `${monthInfo.amharic} ${pad(ethDay)}, ${ethYear} ዓ.ም`,
    formattedEnglish: `${monthInfo.english} ${pad(ethDay)}, ${ethYear} E.C.`,
    fullFormatted: `${monthInfo.amharic} ${pad(ethDay)}, ${ethYear} ዓ.ም (${monthInfo.english} ${pad(ethDay)}, ${ethYear} E.C.)`
  };
}

/**
 * Convert Ethiopian Date (year, month, day) to Gregorian Date object
 */
export function ethToGregorian(ethYear: number, ethMonth: number, ethDay: number): Date {
  const gcYear = ethYear + 7;
  const isPrevLeap = (gcYear - 1) % 4 === 3;
  const newYearDay = isPrevLeap ? 12 : 11;

  const ethNewYear = new Date(gcYear, 8, newYearDay); // Sept 11 or 12
  const dayOffset = (ethMonth - 1) * 30 + (ethDay - 1);

  return new Date(ethNewYear.getTime() + dayOffset * 24 * 60 * 60 * 1000);
}

/**
 * Convert Ethiopian Date (year, month, day) to ISO Date string (YYYY-MM-DD)
 */
export function ethToIsoDateString(ethYear: number, ethMonth: number, ethDay: number): string {
  const d = ethToGregorian(ethYear, ethMonth, ethDay);
  return d.toISOString().split('T')[0];
}

/**
 * Format any ISO/Gregorian date string into dual GC + Ethiopian string
 * e.g. "Sept 14, 2026 • መስከረም 04, 2019 ዓ.ም"
 */
export function formatDualDate(gregorianDateStr: string | Date | null | undefined): string {
  if (!gregorianDateStr) return '';
  const d = typeof gregorianDateStr === 'string' ? new Date(gregorianDateStr) : gregorianDateStr;
  if (isNaN(d.getTime())) return String(gregorianDateStr);

  const gcFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const eth = toEthiopianDate(d);

  if (!eth) return gcFormatted;
  return `${gcFormatted} • ${eth.formattedAmharic}`;
}
