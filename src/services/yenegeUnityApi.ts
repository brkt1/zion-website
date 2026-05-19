import { supabase } from './supabase';
import {
  YenegeUnityAttendee,
  YenegeUnityCommLog,
  YenegeUnityEvent,
  YenegeUnityGroup,
} from '../types/yenegeUnity';

// ─────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────

export const yenegeUnityApi = {
  // ── ATTENDEES ─────────────────────────────────────────────

  getAttendees: async (): Promise<YenegeUnityAttendee[]> => {
    const { data, error } = await supabase
      .from('yenege_unity_attendees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch attendees: ${error.message}`);
    return (data ?? []).map(mapDbToAttendee);
  },

  createAttendee: async (
    attendee: Omit<
      YenegeUnityAttendee,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'status'
      | 'calledStatus'
      | 'followUpNeeded'
      | 'interestLevel'
      | 'confirmedAttendance'
      | 'vipCandidate'
      | 'paymentStatus'
      | 'tags'
      | 'internalNotes'
      | 'communicationHistory'
      | 'checkedIn'
    >
  ): Promise<YenegeUnityAttendee> => {
    // Check if an applicant with this email or phone number is already registered to avoid duplicates
    const { data: existing } = await supabase
      .from('yenege_unity_attendees')
      .select('id, email, phone')
      .or(`email.eq.${attendee.email.trim().toLowerCase()},phone.eq.${attendee.phone.trim()}`)
      .maybeSingle();

    if (existing) {
      if (existing.email && existing.email.toLowerCase() === attendee.email.trim().toLowerCase()) {
        throw new Error('DUPLICATE_EMAIL');
      } else {
        throw new Error('DUPLICATE_PHONE');
      }
    }

    const dbRow = {
      full_name: attendee.fullName,
      profile_photo: attendee.profilePhoto || null,
      gender: attendee.gender,
      age_range: attendee.ageRange,
      phone: attendee.phone,
      email: attendee.email,
      city: attendee.city,
      country: attendee.country,
      job_title: attendee.jobTitle,
      company_name: attendee.companyName,
      industry: attendee.industry,
      years_of_experience: attendee.yearsOfExperience,
      company_size: attendee.companySize,
      website: attendee.website || null,
      linkedin: attendee.linkedin || null,
      business_description: attendee.businessDescription,
      why_attend: attendee.whyAttend,
      opportunities_sought: attendee.opportunitiesSought || null,
      target_peoples: attendee.targetPeoples || null,
      selected_goals: attendee.selectedGoals ?? [],
      biggest_challenge: attendee.biggestChallenge || null,
      current_goals: attendee.currentGoals || null,
      value_offer: attendee.valueOffer || null,
      partnerships_open: attendee.partnershipsOpen || null,
      target_networking_sectors: attendee.targetNetworkingSectors ?? [],
      connection_purpose: attendee.connectionPurpose ?? [],
      event_expectations: attendee.eventExpectations || null,
      networking_style: attendee.networkingStyle ?? 'structured',
      sessions_interest: attendee.sessionsInterest ?? [],
      sponsorship_interest: attendee.sponsorshipInterest ?? false,
      // CRM defaults — all set by admin later
      status: 'pending',
      called_status: 'not_called',
      follow_up_needed: true,
      interest_level: 'medium',
      confirmed_attendance: false,
      vip_candidate: false,
      payment_status: 'unpaid',
      tags: [],
      internal_notes: '',
      communication_history: [],
      checked_in: false,
      qr_code: `unity-${crypto.randomUUID()}`,
      badge_printed: false,
    };

    const { data, error } = await supabase
      .from('yenege_unity_attendees')
      .insert([dbRow])
      .select()
      .single();

    if (error) throw new Error(`Failed to create attendee: ${error.message}`);
    return mapDbToAttendee(data);
  },

  updateAttendee: async (
    id: string,
    updates: Partial<YenegeUnityAttendee>
  ): Promise<YenegeUnityAttendee> => {
    const dbUpdates = mapPartialAttendeeToDb(updates);

    const { data, error } = await supabase
      .from('yenege_unity_attendees')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update attendee: ${error.message}`);
    return mapDbToAttendee(data);
  },

  deleteAttendee: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('yenege_unity_attendees')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete attendee: ${error.message}`);
  },

  addCommLog: async (
    attendeeId: string,
    log: Omit<YenegeUnityCommLog, 'id' | 'createdAt'>
  ): Promise<YenegeUnityAttendee> => {
    // Fetch current history first
    const { data: existing, error: fetchErr } = await supabase
      .from('yenege_unity_attendees')
      .select('communication_history')
      .eq('id', attendeeId)
      .single();

    if (fetchErr) throw new Error(`Failed to fetch attendee history: ${fetchErr.message}`);

    const newLog: YenegeUnityCommLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [
      ...(existing?.communication_history ?? []),
      newLog,
    ];

    return await yenegeUnityApi.updateAttendee(attendeeId, {
      communicationHistory: updatedHistory,
    });
  },

  // ── EVENTS ────────────────────────────────────────────────

  getEvents: async (): Promise<YenegeUnityEvent[]> => {
    const { data, error } = await supabase
      .from('yenege_unity_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch events: ${error.message}`);
    return (data ?? []).map(mapDbToEvent);
  },

  createEvent: async (
    eventData: Omit<YenegeUnityEvent, 'id'>
  ): Promise<YenegeUnityEvent> => {
    const { data, error } = await supabase
      .from('yenege_unity_events')
      .insert([{
        title: eventData.title,
        description: eventData.description ?? '',
        date: eventData.date,
        time: eventData.time ?? '',
        location: eventData.location ?? '',
        capacity: eventData.capacity ?? 120,
        sessions: eventData.sessions ?? [],
        sponsors: eventData.sponsors ?? [],
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create event: ${error.message}`);
    return mapDbToEvent(data);
  },

  updateEvent: async (
    id: string,
    updates: Partial<YenegeUnityEvent>
  ): Promise<YenegeUnityEvent> => {
    const { data, error } = await supabase
      .from('yenege_unity_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return mapDbToEvent(data);
  },

  deleteEvent: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('yenege_unity_events')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete event: ${error.message}`);
  },

  // ── GROUPS / NETWORKING CIRCLES ───────────────────────────

  getGroups: async (): Promise<YenegeUnityGroup[]> => {
    const { data, error } = await supabase
      .from('yenege_unity_groups')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch groups: ${error.message}`);
    return (data ?? []).map(mapDbToGroup);
  },

  createGroup: async (
    groupData: Omit<YenegeUnityGroup, 'id'>
  ): Promise<YenegeUnityGroup> => {
    const { data, error } = await supabase
      .from('yenege_unity_groups')
      .insert([{
        name: groupData.name,
        description: groupData.description ?? '',
        attendee_ids: groupData.attendeeIds ?? [],
        type: groupData.type ?? 'circle',
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create group: ${error.message}`);
    return mapDbToGroup(data);
  },

  updateGroup: async (
    id: string,
    updates: Partial<YenegeUnityGroup>
  ): Promise<YenegeUnityGroup> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.attendeeIds !== undefined) dbUpdates.attendee_ids = updates.attendeeIds;
    if (updates.type !== undefined) dbUpdates.type = updates.type;

    const { data, error } = await supabase
      .from('yenege_unity_groups')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update group: ${error.message}`);
    return mapDbToGroup(data);
  },

  deleteGroup: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('yenege_unity_groups')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete group: ${error.message}`);
  },
};

// ─────────────────────────────────────────────────────────────
//  DB → MODEL MAPPERS
// ─────────────────────────────────────────────────────────────

function mapDbToAttendee(row: Record<string, unknown>): YenegeUnityAttendee {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    profilePhoto: row.profile_photo as string | undefined,
    gender: row.gender as string,
    ageRange: row.age_range as string,
    phone: row.phone as string,
    email: row.email as string,
    city: row.city as string,
    country: row.country as string,
    jobTitle: row.job_title as string,
    companyName: row.company_name as string,
    industry: row.industry as string,
    yearsOfExperience: row.years_of_experience as number,
    companySize: row.company_size as string,
    website: row.website as string | undefined,
    linkedin: row.linkedin as string | undefined,
    businessDescription: row.business_description as string,
    whyAttend: row.why_attend as string,
    opportunitiesSought: row.opportunities_sought as string,
    targetPeoples: row.target_peoples as string,
    selectedGoals: (row.selected_goals as string[]) ?? [],
    biggestChallenge: row.biggest_challenge as string,
    currentGoals: row.current_goals as string,
    valueOffer: row.value_offer as string,
    partnershipsOpen: row.partnerships_open as string,
    targetNetworkingSectors: (row.target_networking_sectors as string[]) ?? [],
    connectionPurpose: (row.connection_purpose as string[]) ?? [],
    eventExpectations: row.event_expectations as string,
    networkingStyle: (row.networking_style as 'structured' | 'informal' | 'mix') ?? 'structured',
    sessionsInterest: (row.sessions_interest as string[]) ?? [],
    sponsorshipInterest: (row.sponsorship_interest as boolean) ?? false,
    status: (row.status as YenegeUnityAttendee['status']) ?? 'pending',
    calledStatus: (row.called_status as YenegeUnityAttendee['calledStatus']) ?? 'not_called',
    followUpNeeded: (row.follow_up_needed as boolean) ?? true,
    interestLevel: (row.interest_level as YenegeUnityAttendee['interestLevel']) ?? 'medium',
    confirmedAttendance: (row.confirmed_attendance as boolean) ?? false,
    vipCandidate: (row.vip_candidate as boolean) ?? false,
    paymentStatus: (row.payment_status as YenegeUnityAttendee['paymentStatus']) ?? 'unpaid',
    tags: (row.tags as string[]) ?? [],
    internalNotes: (row.internal_notes as string) ?? '',
    communicationHistory: (row.communication_history as YenegeUnityCommLog[]) ?? [],
    checkedIn: (row.checked_in as boolean) ?? false,
    checkedInAt: row.checked_in_at as string | undefined,
    qrCode: row.qr_code as string | undefined,
    badgePrinted: (row.badge_printed as boolean) ?? false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPartialAttendeeToDb(att: Partial<YenegeUnityAttendee>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (att.fullName !== undefined)               db.full_name = att.fullName;
  if (att.profilePhoto !== undefined)           db.profile_photo = att.profilePhoto;
  if (att.gender !== undefined)                 db.gender = att.gender;
  if (att.ageRange !== undefined)               db.age_range = att.ageRange;
  if (att.phone !== undefined)                  db.phone = att.phone;
  if (att.email !== undefined)                  db.email = att.email;
  if (att.city !== undefined)                   db.city = att.city;
  if (att.country !== undefined)                db.country = att.country;
  if (att.jobTitle !== undefined)               db.job_title = att.jobTitle;
  if (att.companyName !== undefined)            db.company_name = att.companyName;
  if (att.industry !== undefined)               db.industry = att.industry;
  if (att.yearsOfExperience !== undefined)      db.years_of_experience = att.yearsOfExperience;
  if (att.companySize !== undefined)            db.company_size = att.companySize;
  if (att.website !== undefined)                db.website = att.website;
  if (att.linkedin !== undefined)               db.linkedin = att.linkedin;
  if (att.businessDescription !== undefined)    db.business_description = att.businessDescription;
  if (att.whyAttend !== undefined)              db.why_attend = att.whyAttend;
  if (att.opportunitiesSought !== undefined)    db.opportunities_sought = att.opportunitiesSought;
  if (att.targetPeoples !== undefined)          db.target_peoples = att.targetPeoples;
  if (att.selectedGoals !== undefined)          db.selected_goals = att.selectedGoals;
  if (att.biggestChallenge !== undefined)       db.biggest_challenge = att.biggestChallenge;
  if (att.currentGoals !== undefined)           db.current_goals = att.currentGoals;
  if (att.valueOffer !== undefined)             db.value_offer = att.valueOffer;
  if (att.partnershipsOpen !== undefined)       db.partnerships_open = att.partnershipsOpen;
  if (att.targetNetworkingSectors !== undefined) db.target_networking_sectors = att.targetNetworkingSectors;
  if (att.connectionPurpose !== undefined)      db.connection_purpose = att.connectionPurpose;
  if (att.eventExpectations !== undefined)      db.event_expectations = att.eventExpectations;
  if (att.networkingStyle !== undefined)        db.networking_style = att.networkingStyle;
  if (att.sessionsInterest !== undefined)       db.sessions_interest = att.sessionsInterest;
  if (att.sponsorshipInterest !== undefined)    db.sponsorship_interest = att.sponsorshipInterest;
  if (att.status !== undefined)                 db.status = att.status;
  if (att.calledStatus !== undefined)           db.called_status = att.calledStatus;
  if (att.followUpNeeded !== undefined)         db.follow_up_needed = att.followUpNeeded;
  if (att.interestLevel !== undefined)          db.interest_level = att.interestLevel;
  if (att.confirmedAttendance !== undefined)    db.confirmed_attendance = att.confirmedAttendance;
  if (att.vipCandidate !== undefined)           db.vip_candidate = att.vipCandidate;
  if (att.paymentStatus !== undefined)          db.payment_status = att.paymentStatus;
  if (att.tags !== undefined)                   db.tags = att.tags;
  if (att.internalNotes !== undefined)          db.internal_notes = att.internalNotes;
  if (att.communicationHistory !== undefined)   db.communication_history = att.communicationHistory;
  if (att.checkedIn !== undefined)              db.checked_in = att.checkedIn;
  if (att.checkedInAt !== undefined)            db.checked_in_at = att.checkedInAt;
  if (att.qrCode !== undefined)                 db.qr_code = att.qrCode;
  if (att.badgePrinted !== undefined)           db.badge_printed = att.badgePrinted;
  return db;
}

function mapDbToEvent(row: Record<string, unknown>): YenegeUnityEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    date: row.date as string,
    time: (row.time as string) ?? '',
    location: (row.location as string) ?? '',
    capacity: (row.capacity as number) ?? 120,
    sessions: (row.sessions as YenegeUnityEvent['sessions']) ?? [],
    sponsors: (row.sponsors as YenegeUnityEvent['sponsors']) ?? [],
  };
}

function mapDbToGroup(row: Record<string, unknown>): YenegeUnityGroup {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    attendeeIds: (row.attendee_ids as string[]) ?? [],
    type: (row.type as YenegeUnityGroup['type']) ?? 'circle',
  };
}
