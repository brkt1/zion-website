import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

type LeaderboardEntry = {
  player_name: string;
  score: number;
};

export const useLeaderboard = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userTotalPoints, setUserTotalPoints] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Get top 10 scores
      const { data: leaderboardData } = await supabase
        .from('emoji_scores')
        .select('player_name, score')
        .order('score', { ascending: false })
        .limit(10);

      if (leaderboardData) setLeaderboard(leaderboardData);

      // Get user's rank and total points if authenticated
      if (user?.id) {
        const { data: userScores } = await supabase
          .from('emoji_scores')
          .select('score')
          .eq('player_id', user.id);

        if (userScores) {
          const total = userScores.reduce((sum, row) => sum + (row.score || 0), 0);
          setUserTotalPoints(total);
        }

        // Get user's highest rank
        const { data: rankData } = await supabase.rpc('get_player_emoji_rank', {
          player_id_param: user.id
        });

        if (rankData?.length) {
          setUserRank(rankData[0].rank);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user?.id]);

  return {
    leaderboard,
    userRank,
    userTotalPoints,
    showLeaderboard,
    setShowLeaderboard,
    refreshLeaderboard: fetchLeaderboard,
    isLoading,
  };
};