import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  points: number;
  rank: number;
  games_played: number;
  win_rate: number;
  last_activity: string;
  cafe_id?: string;
  event_id?: string;
}

interface LeaderboardType {
  id: string;
  name: string;
  type: 'global' | 'cafe' | 'weekly' | 'monthly' | 'event';
  scope: 'all' | 'cafe' | 'event';
  cafe_id?: string;
  event_id?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  total_participants: number;
  last_updated: string;
}

interface LeaderboardContextType {
  globalLeaderboard: LeaderboardEntry[];
  cafeLeaderboards: { [cafeId: string]: LeaderboardEntry[] };
  weeklyLeaderboard: LeaderboardEntry[];
  monthlyLeaderboard: LeaderboardEntry[];
  eventLeaderboards: { [eventId: string]: LeaderboardEntry[] };
  isLoading: boolean;
  
  // Leaderboard management
  fetchGlobalLeaderboard: () => Promise<void>;
  fetchCafeLeaderboard: (cafeId: string) => Promise<void>;
  fetchWeeklyLeaderboard: () => Promise<void>;
  fetchMonthlyLeaderboard: () => Promise<void>;
  fetchEventLeaderboard: (eventId: string) => Promise<void>;
  
  // Points management
  updateUserPoints: (userId: string, points: number, gameType: string, cafeId?: string, eventId?: string) => Promise<void>;
  calculateRankings: (leaderboardType: string, scope?: string) => Promise<void>;
  
  // Statistics
  getUserStats: (userId: string) => Promise<{
    totalPoints: number;
    globalRank: number;
    cafeRank?: number;
    gamesPlayed: number;
    winRate: number;
    favoriteGame: string;
  }>;
  
  // Real-time updates
  subscribeToLeaderboardUpdates: (leaderboardType: string, callback: (data: any) => void) => void;
  unsubscribeFromLeaderboardUpdates: (leaderboardType: string) => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};

interface LeaderboardProviderProps {
  children: ReactNode;
}

export const LeaderboardProvider: React.FC<LeaderboardProviderProps> = ({ children }) => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [cafeLeaderboards, setCafeLeaderboards] = useState<{ [cafeId: string]: LeaderboardEntry[] }>({});
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [eventLeaderboards, setEventLeaderboards] = useState<{ [eventId: string]: LeaderboardEntry[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch global leaderboard
  const fetchGlobalLeaderboard = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          avatar_url,
          points,
          created_at,
          last_login
        `)
        .order('points', { ascending: false })
        .limit(100);

      if (error) throw error;

      const leaderboard = data.map((user, index) => ({
        id: user.id,
        user_id: user.id,
        username: user.username || 'Anonymous',
        avatar_url: user.avatar_url,
        points: user.points || 0,
        rank: index + 1,
        games_played: 0, // Will be calculated separately
        win_rate: 0, // Will be calculated separately
        last_activity: user.last_login || user.created_at
      }));

      setGlobalLeaderboard(leaderboard);
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cafe-specific leaderboard
  const fetchCafeLeaderboard = async (cafeId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          player_id,
          score,
          game_type,
          created_at,
          users!inner (
            username,
            avatar_url,
            points
          )
        `)
        .eq('cafe_id', cafeId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate points by user for this cafe
      const userPoints: { [userId: string]: { points: number; games: number; wins: number } } = {};
      
      data.forEach(session => {
        const userId = session.player_id;
        if (!userPoints[userId]) {
          userPoints[userId] = { points: 0, games: 0, wins: 0 };
        }
        userPoints[userId].points += session.score || 0;
        userPoints[userId].games += 1;
        if (session.score && session.score > 0) {
          userPoints[userId].wins += 1;
        }
      });

      // Convert to leaderboard format
      const leaderboard = Object.entries(userPoints)
        .map(([userId, stats]) => ({
          id: userId,
          user_id: userId,
          username: data.find(s => s.player_id === userId)?.users?.username || 'Anonymous',
          avatar_url: data.find(s => s.player_id === userId)?.users?.avatar_url,
          points: stats.points,
          rank: 0, // Will be calculated
          games_played: stats.games,
          win_rate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0,
          last_activity: data.find(s => s.player_id === userId)?.created_at || ''
        }))
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setCafeLeaderboards(prev => ({
        ...prev,
        [cafeId]: leaderboard
      }));
    } catch (error) {
      console.error('Error fetching cafe leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weekly leaderboard
  const fetchWeeklyLeaderboard = async () => {
    try {
      setIsLoading(true);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          player_id,
          score,
          created_at,
          users!inner (
            username,
            avatar_url
          )
        `)
        .gte('created_at', weekStart.toISOString())
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate weekly points
      const userPoints: { [userId: string]: { points: number; games: number } } = {};
      
      data.forEach(session => {
        const userId = session.player_id;
        if (!userPoints[userId]) {
          userPoints[userId] = { points: 0, games: 0 };
        }
        userPoints[userId].points += session.score || 0;
        userPoints[userId].games += 1;
      });

      const leaderboard = Object.entries(userPoints)
        .map(([userId, stats]) => ({
          id: userId,
          user_id: userId,
          username: data.find(s => s.player_id === userId)?.users?.username || 'Anonymous',
          avatar_url: data.find(s => s.player_id === userId)?.users?.avatar_url,
          points: stats.points,
          rank: 0,
          games_played: stats.games,
          win_rate: 0,
          last_activity: data.find(s => s.player_id === userId)?.created_at || ''
        }))
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setWeeklyLeaderboard(leaderboard);
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch monthly leaderboard
  const fetchMonthlyLeaderboard = async () => {
    try {
      setIsLoading(true);
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          player_id,
          score,
          created_at,
          users!inner (
            username,
            avatar_url
          )
        `)
        .gte('created_at', monthStart.toISOString())
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate monthly points
      const userPoints: { [userId: string]: { points: number; games: number } } = {};
      
      data.forEach(session => {
        const userId = session.player_id;
        if (!userPoints[userId]) {
          userPoints[userId] = { points: 0, games: 0 };
        }
        userPoints[userId].points += session.score || 0;
        userPoints[userId].games += 1;
      });

      const leaderboard = Object.entries(userPoints)
        .map(([userId, stats]) => ({
          id: userId,
          user_id: userId,
          username: data.find(s => s.player_id === userId)?.users?.username || 'Anonymous',
          avatar_url: data.find(s => s.player_id === userId)?.users?.avatar_url,
          points: stats.points,
          rank: 0,
          games_played: stats.games,
          win_rate: 0,
          last_activity: data.find(s => s.player_id === userId)?.created_at || ''
        }))
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setMonthlyLeaderboard(leaderboard);
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch event-specific leaderboard
  const fetchEventLeaderboard = async (eventId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          total_points,
          games_played,
          joined_at,
          users!inner (
            username,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('total_points', { ascending: false });

      if (error) throw error;

      const leaderboard = data.map((participant, index) => ({
        id: participant.user_id,
        user_id: participant.user_id,
        username: participant.users?.username || 'Anonymous',
        avatar_url: participant.users?.avatar_url,
        points: participant.total_points,
        rank: index + 1,
        games_played: participant.games_played,
        win_rate: 0, // Calculate based on games won vs total
        last_activity: participant.joined_at
      }));

      setEventLeaderboards(prev => ({
        ...prev,
        [eventId]: leaderboard
      }));
    } catch (error) {
      console.error('Error fetching event leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user points
  const updateUserPoints = async (userId: string, points: number, gameType: string, cafeId?: string, eventId?: string) => {
    try {
      // Update global user points
      const { error: globalError } = await supabase
        .from('users')
        .update({
          points: supabase.sql`points + ${points}`,
          last_login: new Date().toISOString()
        })
        .eq('id', userId);

      if (globalError) throw globalError;

      // Update cafe-specific points if applicable
      if (cafeId) {
        // This would update a cafe-specific points table
        // Implementation depends on your schema
      }

      // Update event-specific points if applicable
      if (eventId) {
        const { error: eventError } = await supabase
          .from('event_participants')
          .update({
            total_points: supabase.sql`total_points + ${points}`,
            games_played: supabase.sql`games_played + 1`
          })
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (eventError) throw eventError;
      }

      // Refresh relevant leaderboards
      await fetchGlobalLeaderboard();
      if (cafeId) await fetchCafeLeaderboard(cafeId);
      if (eventId) await fetchEventLeaderboard(eventId);
    } catch (error) {
      console.error('Error updating user points:', error);
      throw error;
    }
  };

  // Calculate rankings for a specific leaderboard
  const calculateRankings = async (leaderboardType: string, scope?: string) => {
    try {
      switch (leaderboardType) {
        case 'global':
          await fetchGlobalLeaderboard();
          break;
        case 'weekly':
          await fetchWeeklyLeaderboard();
          break;
        case 'monthly':
          await fetchMonthlyLeaderboard();
          break;
        case 'cafe':
          if (scope) await fetchCafeLeaderboard(scope);
          break;
        case 'event':
          if (scope) await fetchEventLeaderboard(scope);
          break;
        default:
          console.warn('Unknown leaderboard type:', leaderboardType);
      }
    } catch (error) {
      console.error('Error calculating rankings:', error);
    }
  };

  // Get user statistics
  const getUserStats = async (userId: string) => {
    try {
      // Get user's global stats
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points, username')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Get user's game history
      const { data: gameHistory, error: gameError } = await supabase
        .from('game_sessions')
        .select('game_type, score, status')
        .eq('player_id', userId)
        .eq('status', 'completed');

      if (gameError) throw gameError;

      // Calculate statistics
      const totalPoints = userData.points || 0;
      const gamesPlayed = gameHistory.length;
      const wins = gameHistory.filter(game => game.score && game.score > 0).length;
      const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

      // Find favorite game
      const gameCounts: { [gameType: string]: number } = {};
      gameHistory.forEach(game => {
        gameCounts[game.game_type] = (gameCounts[game.game_type] || 0) + 1;
      });
      const favoriteGame = Object.entries(gameCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

      // Calculate global rank
      const globalRank = globalLeaderboard.find(entry => entry.user_id === userId)?.rank || 0;

      // Calculate cafe rank (if user has played in cafes)
      let cafeRank = 0;
      if (Object.keys(cafeLeaderboards).length > 0) {
        for (const cafeId in cafeLeaderboards) {
          const cafeRankEntry = cafeLeaderboards[cafeId].find(entry => entry.user_id === userId);
          if (cafeRankEntry) {
            cafeRank = cafeRankEntry.rank;
            break;
          }
        }
      }

      return {
        totalPoints,
        globalRank,
        cafeRank: cafeRank || undefined,
        gamesPlayed,
        winRate,
        favoriteGame
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalPoints: 0,
        globalRank: 0,
        gamesPlayed: 0,
        winRate: 0,
        favoriteGame: 'None'
      };
    }
  };

  // Real-time subscription management
  const subscribeToLeaderboardUpdates = (leaderboardType: string, callback: (data: any) => void) => {
    // Implementation would depend on your real-time setup
    // This could use Supabase real-time subscriptions
    console.log(`Subscribing to ${leaderboardType} updates`);
  };

  const unsubscribeFromLeaderboardUpdates = (leaderboardType: string) => {
    // Implementation would depend on your real-time setup
    console.log(`Unsubscribing from ${leaderboardType} updates`);
  };

  const value: LeaderboardContextType = {
    globalLeaderboard,
    cafeLeaderboards,
    weeklyLeaderboard,
    monthlyLeaderboard,
    eventLeaderboards,
    isLoading,
    fetchGlobalLeaderboard,
    fetchCafeLeaderboard,
    fetchWeeklyLeaderboard,
    fetchMonthlyLeaderboard,
    fetchEventLeaderboard,
    updateUserPoints,
    calculateRankings,
    getUserStats,
    subscribeToLeaderboardUpdates,
    unsubscribeFromLeaderboardUpdates
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
};
