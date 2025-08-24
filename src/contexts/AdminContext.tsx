import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface AdminRole {
  id: string;
  name: string;
  permissions: string[];
  level: number;
}

interface Cafe {
  id: string;
  name: string;
  location: string;
  owner_id: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  contact_info: {
    phone: string;
    email: string;
    address: string;
  };
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'cafe' | 'weekly' | 'monthly' | 'global';
  points_required: number;
  value: number;
  currency: string;
  cafe_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  created_by: string;
  approved_by?: string;
  created_at: string;
  expires_at?: string;
  max_redemptions?: number;
  current_redemptions: number;
}

interface AdminContextType {
  currentRole: AdminRole | null;
  cafes: Cafe[];
  rewards: Reward[];
  qrCodes: any[];
  isLoading: boolean;
  
  // Waiter functions
  generateQRCode: (cafeId: string, gameType: string, mode: string, maxPlayers?: number) => Promise<string>;
  deactivateQRCode: (qrId: string) => Promise<void>;
  
  // Cafe Owner functions
  createCafeReward: (reward: Omit<Reward, 'id' | 'status' | 'created_at' | 'current_redemptions'>) => Promise<Reward>;
  updateCafeReward: (rewardId: string, updates: Partial<Reward>) => Promise<void>;
  deleteCafeReward: (rewardId: string) => Promise<void>;
  
  // Admin functions
  approveCafeReward: (rewardId: string) => Promise<void>;
  rejectCafeReward: (rewardId: string, reason: string) => Promise<void>;
  suspendCafe: (cafeId: string, reason: string) => Promise<void>;
  activateCafe: (cafeId: string) => Promise<void>;
  
  // Super Admin functions
  createGlobalReward: (reward: Omit<Reward, 'id' | 'status' | 'created_at' | 'current_redemptions'>) => Promise<Reward>;
  updateGlobalReward: (rewardId: string, updates: Partial<Reward>) => Promise<void>;
  deleteGlobalReward: (rewardId: string) => Promise<void>;
  manageUserRoles: (userId: string, newRole: string) => Promise<void>;
  
  // Game Night Admin functions
  setupGameNight: (eventData: any) => Promise<string>;
  allocateTablets: (eventId: string, tabletAllocations: any[]) => Promise<void>;
  startGameNight: (eventId: string) => Promise<void>;
  endGameNight: (eventId: string) => Promise<void>;
  
  // Data fetching
  fetchCafes: () => Promise<void>;
  fetchRewards: () => Promise<void>;
  fetchQRCodes: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<AdminRole | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [qrCodes, setQRCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Waiter functions
  const generateQRCode = async (cafeId: string, gameType: string, mode: string, maxPlayers?: number): Promise<string> => {
    try {
      const qrCode = {
        code: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cafe_id: cafeId,
        waiter_id: '', // Will be set from auth context
        game_type: gameType,
        mode: mode as 'solo' | 'multiplayer',
        is_active: true,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        max_players: maxPlayers
      };

      const { data, error } = await supabase
        .from('qr_codes')
        .insert([qrCode])
        .select()
        .single();

      if (error) throw error;

      await fetchQRCodes();
      return data.code;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const deactivateQRCode = async (qrId: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ is_active: false })
        .eq('id', qrId);

      if (error) throw error;

      await fetchQRCodes();
    } catch (error) {
      console.error('Error deactivating QR code:', error);
      throw error;
    }
  };

  // Cafe Owner functions
  const createCafeReward = async (reward: Omit<Reward, 'id' | 'status' | 'created_at' | 'current_redemptions'>): Promise<Reward> => {
    try {
      const newReward = {
        ...reward,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        current_redemptions: 0
      };

      const { data, error } = await supabase
        .from('rewards')
        .insert([newReward])
        .select()
        .single();

      if (error) throw error;

      await fetchRewards();
      return data;
    } catch (error) {
      console.error('Error creating cafe reward:', error);
      throw error;
    }
  };

  const updateCafeReward = async (rewardId: string, updates: Partial<Reward>) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', rewardId);

      if (error) throw error;

      await fetchRewards();
    } catch (error) {
      console.error('Error updating cafe reward:', error);
      throw error;
    }
  };

  const deleteCafeReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;

      await fetchRewards();
    } catch (error) {
      console.error('Error deleting cafe reward:', error);
      throw error;
    }
  };

  // Admin functions
  const approveCafeReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ 
          status: 'approved',
          approved_by: '' // Will be set from auth context
        })
        .eq('id', rewardId);

      if (error) throw error;

      await fetchRewards();
    } catch (error) {
      console.error('Error approving cafe reward:', error);
      throw error;
    }
  };

  const rejectCafeReward = async (rewardId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ 
          status: 'rejected',
          description: `${reason} - Rejected`
        })
        .eq('id', rewardId);

      if (error) throw error;

      await fetchRewards();
    } catch (error) {
      console.error('Error rejecting cafe reward:', error);
      throw error;
    }
  };

  const suspendCafe = async (cafeId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('cafes')
        .update({ 
          status: 'suspended',
          // Add suspension reason to a separate field if needed
        })
        .eq('id', cafeId);

      if (error) throw error;

      await fetchCafes();
    } catch (error) {
      console.error('Error suspending cafe:', error);
      throw error;
    }
  };

  const activateCafe = async (cafeId: string) => {
    try {
      const { error } = await supabase
        .from('cafes')
        .update({ status: 'active' })
        .eq('id', cafeId);

      if (error) throw error;

      await fetchCafes();
    } catch (error) {
      console.error('Error activating cafe:', error);
      throw error;
    }
  };

  // Super Admin functions
  const createGlobalReward = async (reward: Omit<Reward, 'id' | 'status' | 'created_at' | 'current_redemptions'>): Promise<Reward> => {
    try {
      const newReward = {
        ...reward,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        current_redemptions: 0
      };

      const { data, error } = await supabase
        .from('rewards')
        .insert([newReward])
        .select()
        .single();

      if (error) throw error;

      await fetchRewards();
      return data;
    } catch (error) {
      console.error('Error creating global reward:', error);
      throw error;
    }
  };

  const updateGlobalReward = async (rewardId: string, updates: Partial<Reward>) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', rewardId);

      if (error) throw error;

      await fetchRewards();
    } catch (error) {
      console.error('Error updating global reward:', error);
      throw error;
    }
  };

  const deleteGlobalReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;

      await fetchRewards();
    } catch (error) {
      console.error('Error deleting global reward:', error);
      throw error;
    }
  };

  const manageUserRoles = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error managing user role:', error);
      throw error;
    }
  };

  // Game Night Admin functions
  const setupGameNight = async (eventData: any): Promise<string> => {
    try {
      const event = {
        ...eventData,
        status: 'setup',
        created_at: new Date().toISOString(),
        created_by: '' // Will be set from auth context
      };

      const { data, error } = await supabase
        .from('game_night_events')
        .insert([event])
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error setting up game night:', error);
      throw error;
    }
  };

  const allocateTablets = async (eventId: string, tabletAllocations: any[]) => {
    try {
      const allocations = tabletAllocations.map(allocation => ({
        ...allocation,
        event_id: eventId,
        status: 'allocated',
        allocated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('tablet_allocations')
        .insert(allocations);

      if (error) throw error;
    } catch (error) {
      console.error('Error allocating tablets:', error);
      throw error;
    }
  };

  const startGameNight = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('game_night_events')
        .update({ 
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error starting game night:', error);
      throw error;
    }
  };

  const endGameNight = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('game_night_events')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending game night:', error);
      throw error;
    }
  };

  // Data fetching functions
  const fetchCafes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCafes(data || []);
    } catch (error) {
      console.error('Error fetching cafes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQRCodes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQRCodes(data || []);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AdminContextType = {
    currentRole,
    cafes,
    rewards,
    qrCodes,
    isLoading,
    generateQRCode,
    deactivateQRCode,
    createCafeReward,
    updateCafeReward,
    deleteCafeReward,
    approveCafeReward,
    rejectCafeReward,
    suspendCafe,
    activateCafe,
    createGlobalReward,
    updateGlobalReward,
    deleteGlobalReward,
    manageUserRoles,
    setupGameNight,
    allocateTablets,
    startGameNight,
    endGameNight,
    fetchCafes,
    fetchRewards,
    fetchQRCodes
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
