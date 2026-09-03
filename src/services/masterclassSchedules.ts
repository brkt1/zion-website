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

// ── FALLBACK (used only when Supabase is unreachable) ──────────────────────
export const DEFAULT_SCHEDULE_OPTIONS: MasterclassScheduleOption[] = [
  {
    id: 'opt-1',
    val: 'Option 1: Sept 14, 2026 — Morning Session (9:00 AM - 12:00 PM)',
    label: 'Option 1: Sept 14, 2026',
    time: 'Morning Session (9:00 AM - 12:00 PM)',
    date: '2026-09-14',
    is_active: true,
    available_modes: DEFAULT_LEARNING_MODES
  },
  {
    id: 'opt-2',
    val: 'Option 2: Sept 14, 2026 — Evening Session (6:00 PM - 9:00 PM)',
    label: 'Option 2: Sept 14, 2026',
    time: 'Evening Session (6:00 PM - 9:00 PM)',
    date: '2026-09-14',
    is_active: true,
    available_modes: DEFAULT_LEARNING_MODES
  },
  {
    id: 'opt-3',
    val: 'Option 3: Sept 19, 2026 — Weekend Session (Sat & Sun, 9:00 AM - 1:00 PM)',
    label: 'Option 3: Sept 19, 2026',
    time: 'Weekend Session (Sat & Sun, 9:00 AM - 1:00 PM)',
    date: '2026-09-19',
    is_active: true,
    available_modes: DEFAULT_LEARNING_MODES
  },
  {
    id: 'opt-4',
    val: 'Option 4: Oct 5, 2026 — Evening Session (6:00 PM - 9:00 PM)',
    label: 'Option 4: Oct 5, 2026',
    time: 'Evening Session (6:00 PM - 9:00 PM)',
    date: '2026-10-05',
    is_active: true,
    available_modes: DEFAULT_LEARNING_MODES
  }
];

// ── ROW MAPPER ──────────────────────────────────────────────────────────────
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

/**
 * Fetch ALL schedule options from Supabase (admin view — includes inactive).
 * Falls back to localStorage cache, then to DEFAULT_SCHEDULE_OPTIONS.
 */
export const getMasterclassSchedules = async (): Promise<MasterclassScheduleOption[]> => {
  try {
    const { data, error } = await supabase
      .from('masterclass_schedules')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('getMasterclassSchedules Supabase fetch notice:', error.message);
      throw error;
    }
    if (data && data.length > 0) {
      const options = data.map(rowToOption);
      localStorage.setItem('yenege_mc_schedules_cache', JSON.stringify(options));
      return options;
    }

    // Auto-seed defaults if table is empty in backend
    console.log('Seeding default schedules to Supabase...');
    await seedDefaultSchedules();
    const { data: seededData } = await supabase
      .from('masterclass_schedules')
      .select('*')
      .order('display_order', { ascending: true });

    if (seededData && seededData.length > 0) {
      const options = seededData.map(rowToOption);
      localStorage.setItem('yenege_mc_schedules_cache', JSON.stringify(options));
      return options;
    }

    return DEFAULT_SCHEDULE_OPTIONS;
  } catch (e) {
    console.warn('getMasterclassSchedules: using cache fallback.', e);
    try {
      const cached = localStorage.getItem('yenege_mc_schedules_cache');
      if (cached) return JSON.parse(cached) as MasterclassScheduleOption[];
    } catch {}
    return DEFAULT_SCHEDULE_OPTIONS;
  }
};

/**
 * Sync version for the registration form's initial load (reads from localStorage cache).
 */
export const getActiveMasterclassSchedulesSync = (): MasterclassScheduleOption[] => {
  try {
    const cached = localStorage.getItem('yenege_mc_schedules_cache');
    if (cached) {
      const all: MasterclassScheduleOption[] = JSON.parse(cached);
      return all.filter(s => s.is_active);
    }
  } catch {}
  return DEFAULT_SCHEDULE_OPTIONS.filter(s => s.is_active);
};

/**
 * Fetch ACTIVE schedules from Supabase for the registration form.
 */
export const getActiveMasterclassSchedules = async (): Promise<MasterclassScheduleOption[]> => {
  try {
    const { data, error } = await supabase
      .from('masterclass_schedules')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('getActiveMasterclassSchedules Supabase fetch notice:', error.message);
      throw error;
    }

    if (data && data.length > 0) {
      const options = data.map(rowToOption);
      const allCached = localStorage.getItem('yenege_mc_schedules_cache');
      if (allCached) {
        try {
          const all: MasterclassScheduleOption[] = JSON.parse(allCached);
          const inactiveIds = new Set(all.filter(s => !s.is_active).map(s => s.id));
          const merged = [
            ...options,
            ...all.filter(s => inactiveIds.has(s.id)),
          ];
          localStorage.setItem('yenege_mc_schedules_cache', JSON.stringify(merged));
        } catch {}
      } else {
        localStorage.setItem('yenege_mc_schedules_cache', JSON.stringify(options));
      }
      return options;
    }

    // Auto-seed defaults if table is empty in backend
    console.log('Seeding default active schedules to Supabase...');
    await seedDefaultSchedules();
    const { data: seededData } = await supabase
      .from('masterclass_schedules')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (seededData && seededData.length > 0) {
      const options = seededData.map(rowToOption);
      return options;
    }

    return getActiveMasterclassSchedulesSync();
  } catch (e) {
    console.warn('getActiveMasterclassSchedules: using sync fallback.', e);
    return getActiveMasterclassSchedulesSync();
  }
};

// ── ADMIN CRUD (all write to Supabase) ─────────────────────────────────────

const dispatchUpdate = () =>
  window.dispatchEvent(new Event('masterclass_schedules_updated'));

export const addMasterclassSchedule = async (
  option: Omit<MasterclassScheduleOption, 'id' | 'val'> & { customVal?: string }
): Promise<MasterclassScheduleOption[]> => {
  const val = option.customVal || `${option.label} — ${option.time}`;

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
};

export const updateMasterclassSchedule = async (
  id: string,
  updates: Partial<MasterclassScheduleOption>
): Promise<MasterclassScheduleOption[]> => {
  const patch: Record<string, any> = {};
  if (updates.label !== undefined) patch.label = updates.label;
  if (updates.time !== undefined) patch.session_time = updates.time;
  if (updates.date !== undefined) patch.date = updates.date;
  if (updates.is_active !== undefined) patch.is_active = updates.is_active;
  if (updates.max_students !== undefined) patch.max_students = updates.max_students;
  if (updates.available_modes !== undefined) patch.available_modes = updates.available_modes;

  if (updates.label || updates.time) {
    const { data: current } = await supabase
      .from('masterclass_schedules')
      .select('label, session_time')
      .eq('id', id)
      .single();
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
};

export const toggleMasterclassScheduleActive = async (id: string): Promise<MasterclassScheduleOption[]> => {
  const { data: current, error: fetchError } = await supabase
    .from('masterclass_schedules')
    .select('is_active')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('masterclass_schedules')
    .update({ is_active: !current.is_active })
    .eq('id', id);

  if (error) throw error;
  dispatchUpdate();
  return getMasterclassSchedules();
};

export const deleteMasterclassSchedule = async (id: string): Promise<MasterclassScheduleOption[]> => {
  const { error } = await supabase
    .from('masterclass_schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
  dispatchUpdate();
  return getMasterclassSchedules();
};

export const seedDefaultSchedules = async (): Promise<void> => {
  const { count } = await supabase
    .from('masterclass_schedules')
    .select('*', { count: 'exact', head: true });

  if ((count ?? 0) > 0) return;

  const rows = DEFAULT_SCHEDULE_OPTIONS.map((opt, i) => ({
    label: opt.label,
    session_time: opt.time,
    session_date: opt.date ?? null,
    is_active: opt.is_active,
    max_students: opt.max_students ?? null,
    available_modes: opt.available_modes ?? DEFAULT_LEARNING_MODES,
    val: opt.val,
    display_order: i + 1,
  }));

  const { error } = await supabase.from('masterclass_schedules').insert(rows);
  if (error) throw error;
};
