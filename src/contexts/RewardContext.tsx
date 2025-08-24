import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'cafe' | 'weekly' | 'monthly' | 'global';
  points_required: number;
  value: number;
  currency: string;
  cafe_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired';
  created_by: string;
  approved_by?: string;
  created_at: string;
  expires_at?: string;
  max_redemptions?: number;
  current_redemptions: number;
  image_url?: string;
  category: 'food' | 'drink' | 'discount' | 'free_game' | 'merchandise' | 'other';
}

interface RewardRedemption {
  id: string;
  reward_id: string;
  user_id: string;
  redeemed_at: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  points_spent: number;
  cafe_id?: string;
  event_id?: string;
  notes?: string;
  completed_at?: string;
}

interface RewardContextType {
  availableRewards: Reward[];
  userRewards: Reward[];
  redemptionHistory: RewardRedemption[];
  isLoading: boolean;
  
  // Reward management
  fetchAvailableRewards: (cafeId?: string, eventId?: string) => Promise<void>;
  fetchUserRewards: (userId: string) => Promise<void>;
  fetchRedemptionHistory: (userId: string) => Promise<void>;
  
  // Reward redemption
  redeemReward: (rewardId: string, userId: string, points: number) => Promise<RewardRedemption>;
  cancelRedemption: (redemptionId: string) => Promise<void>;
  completeRedemption: (redemptionId: string, notes?: string) => Promise<void>;
  
  // Reward creation and management
  createReward: (reward: Omit<Reward, 'id' | 'status' | 'created_at' | 'current_redemptions'>) => Promise<Reward>;
  updateReward: (rewardId: string, updates: Partial<Reward>) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;
  
  // Reward approval workflow
  approveReward: (rewardId: string, adminId: string) => Promise<void>;
  rejectReward: (rewardId: string, adminId: string, reason: string) => Promise<void>;
  
  // Utility functions
  canUserRedeem: (userId: string, reward: Reward) => Promise<boolean>;
  getRewardValue: (reward: Reward) => number;
  formatRewardValue: (reward: Reward) => string;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const useReward = () => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
};

interface RewardProviderProps {
  children: ReactNode;
}

export const RewardProvider: React.FC<RewardProviderProps> = ({ children }) => {
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<Reward[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RewardRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available rewards
  const fetchAvailableRewards = async (cafeId?: string, eventId?: string) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('rewards')
        .select('*')
        .eq('status', 'active')
        .order('points_required', { ascending: true });

      if (cafeId) {
        query = query.eq('cafe_id', cafeId);
      }

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter out expired rewards
      const now = new Date();
      const validRewards = data.filter(reward => {
        if (!reward.expires_at) return true;
        return new Date(reward.expires_at) > now;
      });

      setAvailableRewards(validRewards || []);
    } catch (error) {
      console.error('Error fetching available rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's rewards
  const fetchUserRewards = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserRewards(data || []);
    } catch (error) {
      console.error('Error fetching user rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch redemption history
  const fetchRedemptionHistory = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards (
            name,
            description,
            image_url,
            category
          )
        `)
        .eq('user_id', userId)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;

      setRedemptionHistory(data || []);
    } catch (error) {
      console.error('Error fetching redemption history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redeem a reward
  const redeemReward = async (rewardId: string, userId: string, points: number): Promise<RewardRedemption> => {
    try {
      // Check if user can redeem
      const reward = availableRewards.find(r => r.id === rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }

      const canRedeem = await canUserRedeem(userId, reward);
      if (!canRedeem) {
        throw new Error('Cannot redeem this reward');
      }

      // Create redemption record
      const redemption: Omit<RewardRedemption, 'id'> = {
        reward_id: rewardId,
        user_id: userId,
        redeemed_at: new Date().toISOString(),
        status: 'pending',
        points_spent: points,
        cafe_id: reward.cafe_id,
        event_id: reward.event_id
      };

      const { data, error } = await supabase
        .from('reward_redemptions')
        .insert([redemption])
        .select()
        .single();

      if (error) throw error;

      // Update reward redemption count
      const { error: updateError } = await supabase
        .from('rewards')
        .update({
          current_redemptions: supabase.sql`current_redemptions + 1`
        })
        .eq('id', rewardId);

      if (updateError) throw updateError;

      // Update user points
      const { error: pointsError } = await supabase
        .from('users')
        .update({
          points: supabase.sql`points - ${points}`
        })
        .eq('id', userId);

      if (pointsError) throw pointsError;

      // Refresh data
      await fetchAvailableRewards(reward.cafe_id, reward.event_id);
      await fetchRedemptionHistory(userId);

      return data;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  };

  // Cancel a redemption
  const cancelRedemption = async (redemptionId: string) => {
    try {
      const { error } = await supabase
        .from('reward_redemptions')
        .update({ status: 'cancelled' })
        .eq('id', redemptionId);

      if (error) throw error;

      // Refresh redemption history
      // Note: We'd need to get the user ID from the redemption record
      // This is a simplified implementation
    } catch (error) {
      console.error('Error cancelling redemption:', error);
      throw error;
    }
  };

  // Complete a redemption
  const completeRedemption = async (redemptionId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('reward_redemptions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes
        })
        .eq('id', redemptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing redemption:', error);
      throw error;
    }
  };

  // Create a new reward
  const createReward = async (reward: Omit<Reward, 'id' | 'status' | 'created_at' | 'current_redemptions'>): Promise<Reward> => {
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

      await fetchAvailableRewards(reward.cafe_id, reward.event_id);
      return data;
    } catch (error) {
      console.error('Error creating reward:', error);
      throw error;
    }
  };

  // Update a reward
  const updateReward = async (rewardId: string, updates: Partial<Reward>) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', rewardId);

      if (error) throw error;

      // Refresh rewards
      await fetchAvailableRewards();
      await fetchUserRewards(updates.created_by || '');
    } catch (error) {
      console.error('Error updating reward:', error);
      throw error;
    }
  };

  // Delete a reward
  const deleteReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;

      // Refresh rewards
      await fetchAvailableRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
      throw error;
    }
  };

  // Approve a reward
  const approveReward = async (rewardId: string, adminId: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({
          status: 'active',
          approved_by: adminId
        })
        .eq('id', rewardId);

      if (error) throw error;

      await fetchAvailableRewards();
    } catch (error) {
      console.error('Error approving reward:', error);
      throw error;
    }
  };

  // Reject a reward
  const rejectReward = async (rewardId: string, adminId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({
          status: 'rejected',
          description: `${reason} - Rejected by admin`
        })
        .eq('id', rewardId);

      if (error) throw error;

      await fetchAvailableRewards();
    } catch (error) {
      console.error('Error rejecting reward:', error);
      throw error;
    }
  };

  // Check if user can redeem a reward
  const canUserRedeem = async (userId: string, reward: Reward): Promise<boolean> => {
    try {
      // Check if reward is active
      if (reward.status !== 'active') return false;

      // Check if reward has expired
      if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
        return false;
      }

      // Check if max redemptions reached
      if (reward.max_redemptions && reward.current_redemptions >= reward.max_redemptions) {
        return false;
      }

      // Check if user has enough points
      const { data: userData, error } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      if (error || !userData) return false;

      return userData.points >= reward.points_required;
    } catch (error) {
      console.error('Error checking if user can redeem:', error);
      return false;
    }
  };

  // Get reward value
  const getRewardValue = (reward: Reward): number => {
    return reward.value;
  };

  // Format reward value for display
  const formatRewardValue = (reward: Reward): string => {
    if (reward.currency === 'ETB') {
      return `₦${reward.value}`;
    }
    return `${reward.value} ${reward.currency}`;
  };

  const value: RewardContextType = {
    availableRewards,
    userRewards,
    redemptionHistory,
    isLoading,
    fetchAvailableRewards,
    fetchUserRewards,
    fetchRedemptionHistory,
    redeemReward,
    cancelRedemption,
    completeRedemption,
    createReward,
    updateReward,
    deleteReward,
    approveReward,
    rejectReward,
    canUserRedeem,
    getRewardValue,
    formatRewardValue
  };

  return (
    <RewardContext.Provider value={value}>
      {children}
    </RewardContext.Provider>
  );
};
