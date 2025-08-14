import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

type PlayerProgress = {
  playerId: string;
  playerName: string;
  currentStage: number;
  totalWins: number;
  sessionsPlayed: number;
  rewardsClaimed: string[];
  lastWin: string | null;
};

export const usePlayerProgress = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [progress, setProgress] = useState<PlayerProgress>({
    playerId: '',
    playerName: '',
    currentStage: 1,
    totalWins: 0,
    sessionsPlayed: 0,
    rewardsClaimed: [],
    lastWin: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = async (playerId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('emoji_player_progress')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProgress({
          playerId: data.player_id,
          playerName: data.player_name,
          currentStage: data.current_stage,
          totalWins: data.total_wins,
          sessionsPlayed: data.sessions_played,
          rewardsClaimed: data.rewards_claimed || [],
          lastWin: data.last_win,
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<PlayerProgress>) => {
    const playerId = updates.playerId || progress.playerId;
    if (!playerId) return;

    const newProgress = {
      ...progress,
      ...updates,
      playerId,
    };

    try {
      const { error } = await supabase
        .from('emoji_player_progress')
        .upsert({
          player_id: playerId,
          player_name: newProgress.playerName,
          current_stage: newProgress.currentStage,
          total_wins: newProgress.totalWins,
          sessions_played: newProgress.sessionsPlayed,
          rewards_claimed: newProgress.rewardsClaimed,
          last_win: newProgress.lastWin || new Date().toISOString(),
        }, {
          onConflict: 'player_id'
        });

      if (error) throw error;

      setProgress(newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProgress(user.id);
    }
  }, [user?.id]);

  return { progress, isLoading, updateProgress };
};