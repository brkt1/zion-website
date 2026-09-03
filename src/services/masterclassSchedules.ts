import { toEthiopianDate } from '../utils/ethiopianCalendar';

export interface MasterclassScheduleOption {
  id: string;
  val: string;
  label: string;
  time: string;
  date?: string;
  ethiopianDate?: string;
  is_active: boolean;
  max_students?: number;
}

export const formatScheduleEthTag = (dateStr?: string): string => {
  if (!dateStr) return '';
  const eth = toEthiopianDate(dateStr);
  return eth ? `${eth.formattedAmharic} (${eth.monthNameEnglish} ${eth.day < 10 ? '0' + eth.day : eth.day}, ${eth.year} E.C.)` : '';
};

export const DEFAULT_SCHEDULE_OPTIONS: MasterclassScheduleOption[] = [
  {
    id: 'opt-1',
    val: 'Option 1: Sept 14, 2026 — Morning Session (9:00 AM - 12:00 PM)',
    label: 'Option 1: Sept 14, 2026',
    time: 'Morning Session (9:00 AM - 12:00 PM)',
    date: '2026-09-14',
    is_active: true
  },
  {
    id: 'opt-2',
    val: 'Option 2: Sept 14, 2026 — Evening Session (6:00 PM - 9:00 PM)',
    label: 'Option 2: Sept 14, 2026',
    time: 'Evening Session (6:00 PM - 9:00 PM)',
    date: '2026-09-14',
    is_active: true
  },
  {
    id: 'opt-3',
    val: 'Option 3: Sept 19, 2026 — Weekend Session (Sat & Sun, 9:00 AM - 1:00 PM)',
    label: 'Option 3: Sept 19, 2026',
    time: 'Weekend Session (Sat & Sun, 9:00 AM - 1:00 PM)',
    date: '2026-09-19',
    is_active: true
  },
  {
    id: 'opt-4',
    val: 'Option 4: Oct 5, 2026 — Evening Session (6:00 PM - 9:00 PM)',
    label: 'Option 4: Oct 5, 2026',
    time: 'Evening Session (6:00 PM - 9:00 PM)',
    date: '2026-10-05',
    is_active: true
  }
];

const STORAGE_KEY = 'yenege_masterclass_schedules_v1';

export const getMasterclassSchedules = (): MasterclassScheduleOption[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULE_OPTIONS));
      return DEFAULT_SCHEDULE_OPTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading masterclass schedules:', e);
  }
  return DEFAULT_SCHEDULE_OPTIONS;
};

export const getActiveMasterclassSchedules = (): MasterclassScheduleOption[] => {
  const all = getMasterclassSchedules();
  const active = all.filter(s => s.is_active);
  return active.length > 0 ? active : DEFAULT_SCHEDULE_OPTIONS;
};

export const saveMasterclassSchedules = (schedules: MasterclassScheduleOption[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    window.dispatchEvent(new Event('masterclass_schedules_updated'));
  } catch (e) {
    console.error('Error saving masterclass schedules:', e);
  }
};

export const addMasterclassSchedule = (option: Omit<MasterclassScheduleOption, 'id' | 'val'> & { customVal?: string }) => {
  const schedules = getMasterclassSchedules();
  const newId = `opt-${Date.now()}`;
  const fullVal = option.customVal || `${option.label} — ${option.time}`;
  const newOption: MasterclassScheduleOption = {
    id: newId,
    val: fullVal,
    label: option.label,
    time: option.time,
    date: option.date,
    is_active: option.is_active !== undefined ? option.is_active : true,
    max_students: option.max_students
  };
  const updated = [...schedules, newOption];
  saveMasterclassSchedules(updated);
  return updated;
};

export const updateMasterclassSchedule = (id: string, updates: Partial<MasterclassScheduleOption>) => {
  const schedules = getMasterclassSchedules();
  const updated = schedules.map(s => {
    if (s.id === id) {
      const next = { ...s, ...updates };
      if (updates.label || updates.time) {
        next.val = `${next.label} — ${next.time}`;
      }
      return next;
    }
    return s;
  });
  saveMasterclassSchedules(updated);
  return updated;
};

export const toggleMasterclassScheduleActive = (id: string) => {
  const schedules = getMasterclassSchedules();
  const updated = schedules.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s);
  saveMasterclassSchedules(updated);
  return updated;
};

export const deleteMasterclassSchedule = (id: string) => {
  const schedules = getMasterclassSchedules();
  const updated = schedules.filter(s => s.id !== id);
  saveMasterclassSchedules(updated);
  return updated;
};
