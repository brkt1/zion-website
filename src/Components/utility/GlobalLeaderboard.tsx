import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalScore: number;
  rank: number;
}

interface GlobalLeaderboardProps {
  onTopRank?: (rank: number, score: number) => void;
  minimal?: boolean;
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ onTopRank, minimal }) => {
  const { user, session } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [showRankUp, setShowRankUp] = useState(false);
  const prevRankRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch leaderboard from backend
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = session?.access_token;
      const response = await fetch('/api/leaderboard/global', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data: LeaderboardEntry[] = await response.json();
      setLeaderboard(data);
      if (user?.id) {
        const idx = data.findIndex(entry => entry.playerId === user.id);
        if (idx !== -1) {
          // Rank-up animation logic
          if (prevRankRef.current && idx + 1 < prevRankRef.current) {
            setShowRankUp(true);
            setTimeout(() => setShowRankUp(false), 3000);
          }
          prevRankRef.current = idx + 1;
          setUserRank(idx + 1);
          setUserScore(data[idx].totalScore);
          // Notify parent if in top 3
          if (onTopRank && idx + 1 <= 3) {
            onTopRank(idx + 1, data[idx].totalScore);
          }
        } else {
          setUserRank(null);
          setUserScore(null);
          if (onTopRank) onTopRank(-1, 0);
        }
      }
    } catch (e) {
      setLeaderboard([]);
      setUserRank(null);
      setUserScore(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    // Poll every 10 seconds
    intervalRef.current = setInterval(fetchLeaderboard, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, session]);

  return (
    <div className={minimal ? "bg-white/5 rounded-lg border border-white/10 p-2" : "bg-white/10 p-6 rounded-xl border border-white/20 max-w-md mx-auto mt-8 relative"}>
      {/* Rank-up animation */}
      {!minimal && showRankUp && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-500/90 text-white px-6 py-3 rounded-full shadow-lg animate-bounce text-lg font-bold border-2 border-green-300">
            🎉 Rank Up! You moved up the leaderboard!
          </div>
        </div>
      )}
      {!minimal && (
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">🌍 Global Winners Leaderboard</h2>
      )}
      {loading ? (
        <div className="text-center text-white/70 text-sm">Loading...</div>
      ) : (
        <ol className={minimal ? "space-y-1" : "space-y-2"}>
          {leaderboard.slice(0, minimal ? 5 : 10).map((entry, idx) => (
            <li key={entry.playerId} className={`flex justify-between items-center text-sm ${user?.id === entry.playerId ? 'bg-yellow-900/40 rounded font-bold text-yellow-200' : ''}`}>
              <span>
                {idx === 0 && '🥇 '}
                {idx === 1 && '🥈 '}
                {idx === 2 && '🥉 '}
                {idx + 1}. {entry.playerName}
              </span>
              <span className="text-amber-300 font-bold">{entry.totalScore}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default GlobalLeaderboard;
