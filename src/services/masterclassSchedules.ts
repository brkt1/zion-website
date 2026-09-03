import { supabase } from './supabase';
import { toEthiopianDate } from '../utils/ethiopianCalendar';

export interface LearningModeConfig {
  mode: string; // 'In-person' | 'Full Online' | 'Hybrid' or custom
  amMode?: string;
  omMode?: string;
  price: string; // e.g. "15,000 ETB"
  desc?: string;
  enabled: boolean;
}

export interface MasterclassScheduleOption {
  id: string;
  val: string;
  label: string;
  time: string;
  date?: string;
  ethiopianDate?: string;
  is_active: boolean;
  max_students?: number;
  available_modes?: LearningModeConfig[];
}

export const DEFAULT_LEARNING_MODES: LearningModeConfig[] = [
  { mode: 'In-person', amMode: 'በአካል', omMode: 'Qaamaan', price: '15,000 ETB', desc: 'Face-to-face immersive workshops', enabled: true },
  { mode: 'Full Online', amMode: 'ኦንላይን', omMode: 'Intarneetiin', price: '7,000 ETB', desc: 'Remote digital curriculum', enabled: true },
  { mode: 'Hybrid', amMode: 'ሃይብሪድ', omMode: 'Makuu', price: '10,000 ETB', desc: 'Mixed offline & online delivery', enabled: true },
];

export const formatScheduleEthTag = (dateStr?: string): string => {
  if (!dateStr) return '';
  const eth = toEthiopianDate(dateStr);
  return eth ? `${eth.formattedAmharic} (${eth.monthNameEnglish} ${eth.day < 10 ? '0' + eth.day : eth.day}, ${eth.year} E.C.)` : '';
};

// ── NO HARDCODED FALLBACK OPTIONS ─────────────────────────────────────
export const DEFAULT_SCHEDULE_OPTIONS: MasterclassScheduleOption[] = [];

const STORAGE_KEY = 'yenege_mc_schedules_cache';

const getLocalStorageSchedules = (): MasterclassScheduleOption[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const dispatchUpdate = () =>
  window.dispatchEvent(new Event('masterclass_schedules_updated'));

const setLocalStorageSchedules = (list: MasterclassScheduleOption[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
  dispatchUpdate();
};

const rowToOption = (row: any): MasterclassScheduleOption => ({
  id: row.id,
  label: row.label,
  time: row.session_time,
  date: row.session_date ?? undefined,
  is_active: row.is_active,
  max_students: row.max_students ?? undefined,
  val: row.val || `${row.label} — ${row.session_time}`,
  available_modes: row.available_modes || row.allowed_modes || DEFAULT_LEARNING_MODES,
});

// ── PUBLIC API ──────────────────────────────────────────────────────────────

export const getMasterclassSchedules = async (): Promise<MasterclassScheduleOption[]> => {
  try {
    const { data, error } = await supabase
      .from('masterclass_schedules')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('masterclass_schedules database note:', error.message);
      return getLocalStorageSchedules();
    }
    if (data && Array.isArray(data)) {
      const options = data.map(rowToOption);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
      return options;
    }

    return getLocalStorageSchedules();
  } catch (e) {
    return getLocalStorageSchedules();
  }
};

export const getActiveMasterclassSchedulesSync = (): MasterclassScheduleOption[] => {
  const all = getLocalStorageSchedules();
  return all.filter(s => s.is_active);
};

export const getActiveMasterclassSchedules = async (): Promise<MasterclassScheduleOption[]> => {
  try {
    const { data, error } = await supabase
      .from('masterclass_schedules')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) {
      return getActiveMasterclassSchedulesSync();
    }

    const options = data.map(rowToOption);
    return options;
  } catch (e) {
    return getActiveMasterclassSchedulesSync();
  }
};

// ── ADMIN CRUD ──────────────────────────────────────────────────────────────

export const addMasterclassSchedule = async (
  option: Omit<MasterclassScheduleOption, 'id' | 'val'> & { customVal?: string }
): Promise<MasterclassScheduleOption[]> => {
  const val = option.customVal || `${option.label} — ${option.time}`;

  try {
    const { data: existing } = await supabase
      .from('masterclass_schedules')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.display_order ?? 0) + 1;

    const { error } = await supabase
      .from('masterclass_schedules')
      .insert({
        label: option.label,
        session_time: option.time,
        session_date: option.date ?? null,
        is_active: option.is_active ?? true,
        max_students: option.max_students ?? null,
        available_modes: option.available_modes ?? DEFAULT_LEARNING_MODES,
        val,
        display_order: nextOrder,
      });

    if (error) throw error;
    dispatchUpdate();
    return getMasterclassSchedules();
  } catch (err) {
    console.warn('addMasterclassSchedule using local cache fallback:', err);
    const list = getLocalStorageSchedules();
    const newSchedule: MasterclassScheduleOption = {
      id: `opt-${Date.now()}`,
      label: option.label,
      time: option.time,
      date: option.date,
      is_active: option.is_active ?? true,
      max_students: option.max_students,
      available_modes: option.available_modes ?? DEFAULT_LEARNING_MODES,
      val,
    };
    const updated = [...list, newSchedule];
    setLocalStorageSchedules(updated);
    return updated;
  }
};

export const updateMasterclassSchedule = async (
  id: string,
  updates: Partial<MasterclassScheduleOption>
): Promise<MasterclassScheduleOption[]> => {
  try {
    const patch: Record<string, any> = {};
    if (updates.label !== undefined) patch.label = updates.label;
    if (updates.time !== undefined) patch.session_time = updates.time;
    if (updates.date !== undefined) patch.session_date = updates.date;
    if (updates.is_active !== undefined) patch.is_active = updates.is_active;
    if (updates.max_students !== undefined) patch.max_students = updates.max_students;
    if (updates.available_modes !== undefined) patch.available_modes = updates.available_modes;

    if (updates.label || updates.time) {
      const { data: current } = await supabase
        .from('masterclass_schedules')
        .select('label, session_time')
        .eq('id', id)
        .maybeSingle();
      const newLabel = updates.label ?? current?.label ?? '';
      const newTime = updates.time ?? current?.session_time ?? '';
      patch.val = `${newLabel} — ${newTime}`;
    }

    const { error } = await supabase
      .from('masterclass_schedules')
      .update(patch)
      .eq('id', id);

    if (error) throw error;
    dispatchUpdate();
    return getMasterclassSchedules();
  } catch (err) {
    console.warn('updateMasterclassSchedule using local cache fallback:', err);
    const list = getLocalStorageSchedules();
    const updated = list.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setLocalStorageSchedules(updated);
    return updated;
  }
};

export const toggleMasterclassScheduleActive = async (id: string): Promise<MasterclassScheduleOption[]> => {
  try {
    const { data: current, error: fetchError } = await supabase
      .from('masterclass_schedules')
      .select('is_active')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!current) {
      const list = getLocalStorageSchedules();
      const target = list.find(s => s.id === id);
      const newActive = target ? !target.is_active : false;
      const updated = list.map(item =>
        item.id === id ? { ...item, is_active: newActive } : item
      );
      setLocalStorageSchedules(updated);
      return updated;
    }

    const { error } = await supabase
      .from('masterclass_schedules')
      .update({ is_active: !current.is_active })
      .eq('id', id);

    if (error) throw error;
    dispatchUpdate();
    return getMasterclassSchedules();
  } catch (err) {
    console.warn('toggleMasterclassScheduleActive using local cache fallback:', err);
    const list = getLocalStorageSchedules();
    const updated = list.map(item =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
    setLocalStorageSchedules(updated);
    return updated;
  }
};

export const deleteMasterclassSchedule = async (id: string): Promise<MasterclassScheduleOption[]> => {
  try {
    const { error } = await supabase
      .from('masterclass_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    dispatchUpdate();
    return getMasterclassSchedules();
  } catch (err) {
    console.warn('deleteMasterclassSchedule using local cache fallback:', err);
    const list = getLocalStorageSchedules();
    const updated = list.filter(item => item.id !== id);
    setLocalStorageSchedules(updated);
    return updated;
  }
};
