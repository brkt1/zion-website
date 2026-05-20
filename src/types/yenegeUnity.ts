export interface YenegeUnityAttendee {
  id: string;
  fullName: string;
  profilePhoto?: string;
  gender: string;
  ageRange: string;
  phone: string;
  email: string;
  city: string;
  country: string;

  // Professional Information
  jobTitle: string;
  companyName: string;
  industry: string;
  yearsOfExperience: number;
  companySize: string;
  website?: string;
  linkedin?: string;
  businessDescription: string;

  // Networking Goals
  whyAttend: string;
  opportunitiesSought: string;
  targetPeoples: string;
  selectedGoals: string[]; // Find clients, Find investors, etc.

  // Business Insights
  biggestChallenge: string;
  currentGoals: string;
  valueOffer: string; // What can you offer?
  partnershipsOpen: string;
  targetNetworkingSectors: string[]; // Multi-select dropdown

  // Connection Purpose
  connectionPurpose: string[]; // Business partnerships, finding clients, etc.

  // Event Expectations
  eventExpectations: string;
  networkingStyle: 'structured' | 'informal' | 'mix';
  sessionsInterest: string[];
  sponsorshipInterest: boolean;

  // Admin CRM Fields
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  calledStatus: 'not_called' | 'called' | 'no_answer' | 'left_message';
  followUpNeeded: boolean;
  interestLevel: 'low' | 'medium' | 'high' | 'vip';
  confirmedAttendance: boolean;
  vipCandidate: boolean;
  paymentStatus: 'unpaid' | 'paid' | 'waived';
  tags: string[]; // VIP, Investor, Startup Founder, Sponsor, etc.
  internalNotes: string;
  communicationHistory: YenegeUnityCommLog[];
  
  // Checking/Attendance Fields
  checkedIn: boolean;
  checkedInAt?: string;
  qrCode?: string; // QR code payload or representation
  badgePrinted?: boolean;
  welcomeEmailSent?: boolean;

  createdAt: string;
  updatedAt: string;
  accessCode?: string; // For Attendee Portal Login
}

export interface YenegeUnityCommLog {
  id: string;
  userId: string; // admin user who made the entry
  userName: string;
  type: 'call' | 'email' | 'whatsapp' | 'note';
  note: string;
  createdAt: string;
}

export interface YenegeUnityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  sessions: YenegeUnitySession[];
  sponsors: YenegeUnitySponsor[];
}

export interface YenegeUnitySession {
  id: string;
  title: string;
  speaker: string;
  time: string;
  location: string;
  description: string;
}

export interface YenegeUnitySponsor {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'silver' | 'partner';
  logoUrl?: string;
  websiteUrl?: string;
}

export interface YenegeUnityGroup {
  id: string;
  name: string;
  description: string;
  attendeeIds: string[];
  type: 'circle' | 'table' | 'custom';
}

export interface YenegeUnityMatch {
  id: string;
  attendeeId: string;
  matchedAttendeeId: string;
  status: 'pending' | 'met' | 'follow_up' | 'closed';
  notes: string;
  createdAt: string;
  updatedAt: string;
  matchedAttendee?: YenegeUnityAttendee; // Populated by join
}
