import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { ConfettiEffect } from "../Components/effects/ConfettiEffect";
import { EmojiCard } from "../Components/game/EmojiCard";
import { GameControls } from "../Components/game/GameControls";
import { GameHeader } from "../Components/game/GameHeader";
import { GameSessionGuard } from "../Components/game/GameSessionGuard";
import { IntroScreen } from "../Components/game/IntroScreen";
import { RewardModal } from "../Components/game/RewardModal";
import { LoadingSpinner } from "../Components/ui/LoadingSpinner";
import GlobalLeaderboard from "../Components/utility/GlobalLeaderboard";
import { useGameSession } from "../hooks/useGameSession";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { usePlayerProgress } from "../hooks/usePlayerProgress";
import type { Emoji, GameConfig, RewardType } from "../types/game";

export const EmojiGame = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const user = useUser();
  // Removed session usage, use user instead

  // Game state
  const [currentEmoji, setCurrentEmoji] = useState<Emoji | null>(null);
  const [guess, setGuess] = useState("");

  // Safe setter for guess to ensure it's always a string
  const setGuessSafe = (value: any) => {
    if (typeof value === 'string') {
      setGuess(value);
    } else {
      console.warn('Attempted to set guess to non-string value:', value, 'Type:', typeof value, 'Stack:', new Error().stack);
      setGuess(String(value || ''));
    }
  };
  const [score, setScore] = useState(0);
  const [remainingTries, setRemainingTries] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [nextStageEmojis, setNextStageEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [hintCount, setHintCount] = useState(3);
  const [currentReward, setCurrentReward] = useState<RewardType | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [hintString, setHintString] = useState("");
  const [timer, setTimer] = useState(30);
  const [playerName, setPlayerName] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Dynamic game configuration
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    rewardThresholds: {},
    stageRequirements: {},
    maxStage: 1,
  });

  // Custom hooks
  const { startSession } = useGameSession();
  const { progress, updateProgress } = usePlayerProgress();
  const {
    leaderboard,
    userRank,
    userTotalPoints,
    showLeaderboard,
    setShowLeaderboard,
    refreshLeaderboard,
  } = useLeaderboard();

  // Get player info from user
  const googleName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0];
  const googleId = user?.id || "";

  // Fetch game configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: rewards, error: rewardsError } = await supabase
          .from("emoji_rewards")
          .select("*");

        const { data: stages, error: stagesError } = await supabase
          .from("emoji_stages")
          .select("*")
          .order("stage_number", { ascending: true });

        if (rewardsError || stagesError) {
          console.error("Error fetching config:", rewardsError || stagesError);
          return;
        }

        const thresholds = rewards?.reduce(
          (acc, r) => ({
            ...acc,
            [r.reward_type.toUpperCase()]: r.threshold,
          }),
          {}
        );

        const requirements = stages?.reduce(
          (acc, s) => ({
            ...acc,
            [s.stage_number]: s,
          }),
          {}
        );

        const maxStage = Math.max(
          ...(stages?.map((s) => s.stage_number) || [1])
        );

        setGameConfig({
          rewardThresholds: thresholds || {},
          stageRequirements: requirements || {},
          maxStage,
        });
      } catch (error) {
        console.error("Error loading game config:", error);
      }
    };

    fetchConfig();
  }, [supabase]);

  // Preload next stage emojis
  const preloadNextStageEmojis = useCallback(async (nextStage: number) => {
    if (nextStage > gameConfig.maxStage) return;

    const difficultyRange = [
      Math.max(1, nextStage - 1),
      Math.min(5, nextStage + 1),
    ];

    const { data } = await supabase
      .from("emojis")
      .select("*")
      .gte("difficulty", difficultyRange[0])
      .lte("difficulty", difficultyRange[1])
      .limit(20);

    setNextStageEmojis((data || []) as Emoji[]);
  }, [gameConfig.maxStage, supabase]);

  // Select random emoji from list
  const selectRandomEmoji = useCallback((emojiList: Emoji[]) => {
    if (!emojiList.length) {
      setGameOver(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * emojiList.length);
    setCurrentEmoji(emojiList[randomIndex]);
    setGuessSafe("");
    setShowHint(false);
    setFeedback(null);
    setHintString("");
    setTimer(30);
  }, []);

  // Fetch emojis with difficulty scaling
  const fetchEmojis = useCallback(
    async (stage: number) => {
      setIsLoading(true);
      try {
        if (nextStageEmojis.length > 0 && stage === currentStage + 1) {
          setEmojis(nextStageEmojis);
          selectRandomEmoji(nextStageEmojis);
          return;
        }

        const difficultyRange = [
          Math.max(1, stage - 1),
          Math.min(5, stage + 1),
        ];

        const { data, error } = await supabase
          .from("emojis")
          .select("*")
          .gte("difficulty", difficultyRange[0])
          .lte("difficulty", difficultyRange[1])
          .order("difficulty", { ascending: stage < 3 });

        if (error) throw error;

        if (data?.length) {
          setEmojis(data as Emoji[]);
          selectRandomEmoji(data as Emoji[]);
          preloadNextStageEmojis(stage + 1);
        } else {
          setFeedback("Failed to load emojis. Please try again.");
        }
      } catch (error) {
        setFeedback("Failed to load emojis. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentStage, nextStageEmojis.length, supabase, preloadNextStageEmojis, selectRandomEmoji]
  );

  const handleGuess = async () => {
    if (!currentEmoji || !guess || typeof guess !== 'string' || !guess.trim()) return;

    const isCorrect =
      guess.toLowerCase().trim() === currentEmoji.title.toLowerCase().trim();

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);

      // Update streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      setFeedback(`Correct! 🎉 The answer is "${currentEmoji.title}".`);

      // Check for stage completion
      const stageReq = gameConfig.stageRequirements[currentStage];
      if (stageReq && newScore >= stageReq.score) {
        setCurrentReward(stageReq.reward_type);
        setShowRewardModal(true);
        setShowConfetti(true);

        // Update player progress
        await updateProgress({
          totalWins: progress.totalWins + 1,
          rewardsClaimed: [...progress.rewardsClaimed, stageReq.reward_type],
          currentStage: Math.min(currentStage + 1, gameConfig.maxStage),
        });

        // Save certificate
        await supabase.from("emoji_certificates").insert({
          player_name: playerName,
          player_id: googleId || sessionId,
          game_type: "emoji",
          score: newScore,
          reward_type: stageReq.reward_type,
          session_id: sessionId,
        });

        // Advance to next stage
        const nextStage = Math.min(currentStage + 1, gameConfig.maxStage);
        setCurrentStage(nextStage);
        fetchEmojis(nextStage);
      }

      // Remove used emoji
      setEmojis((prev) => prev.filter((e) => e.id !== currentEmoji.id));
      setHintCount(3);
    } else {
      // Incorrect guess
      const newTries = remainingTries - 1;
      setRemainingTries(newTries);
      setStreak(0);
      setFeedback("Incorrect! 😢 Try again.");

      if (newTries <= 0) {
        endGame();
      }
    }
  };

  const endGame = async () => {
    setGameOver(true);
    await saveScore();
    navigate("/game-result", {
      state: {
        sessionId,
        playerId: googleId || sessionId,
        playerName,
        gameType: "Emoji Game",
        score,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const generateHint = () => {
    if (hintCount > 0 && currentEmoji) {
      const titleWords = currentEmoji.title.split(" ");
      const lastWord = titleWords.pop();
      setHintString(`______ ${lastWord}`);
      setShowHint(true);
      setHintCount((prev) => prev - 1);
    }
  };

  const saveScore = async () => {
    try {
      await supabase.from("emoji_scores").insert({
        player_name: playerName,
        player_id: googleId || sessionId,
        score,
        game_type: "emoji",
        stage: currentStage,
        session_id: sessionId,
        streak: maxStreak,
      });

      refreshLeaderboard();
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  const handleSkip = () => {
    if (emojis.length > 1) {
      setFeedback("Skipped! Next emoji.");
      setEmojis((prev) => {
        const filtered = prev.filter((e) => e.id !== currentEmoji?.id);
        selectRandomEmoji(filtered);
        return filtered;
      });
      setHintCount(3);
    } else {
      setFeedback("No more emojis left to skip!");
      endGame();
    }
  };

  const handleStartGame = async () => {
    const nameToUse = googleName || playerName;
    const idToUse = googleId || uuidv4();

    if (!nameToUse || nameToUse.trim().length < 3) {
      setFeedback("Please enter a name with at least 3 characters");
      return;
    }

    setPlayerName(nameToUse);
    setSessionId(uuidv4());

    // Start game session (30 minutes)
    await startSession("emoji-game", nameToUse, 1800);

    // Initialize player progress
    await updateProgress({
      playerId: idToUse,
      playerName: nameToUse,
      currentStage: 1,
    });

    setShowIntro(false);
    fetchEmojis(1);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!showIntro && !gameOver && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && !gameOver) {
      const newTries = remainingTries - 1;
      setRemainingTries(newTries);

      if (newTries <= 0) {
        endGame();
      } else {
        setFeedback("Time is up! Next emoji.");
        setEmojis((prev) => prev.filter((e) => e.id !== currentEmoji?.id));
        // Use a callback to avoid stale closure issues
        setEmojis((prev) => {
          const filtered = prev.filter((e) => e.id !== currentEmoji?.id);
          selectRandomEmoji(filtered);
          return filtered;
        });
        setHintCount(3);
        setTimer(20);
      }
    }

    return () => clearInterval(interval);
  }, [timer, showIntro, gameOver, remainingTries, currentEmoji?.id, selectRandomEmoji]);

  // Confetti effect timeout
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Ensure guess is always a string - add this effect early
  useEffect(() => {
    if (guess !== null && guess !== undefined && typeof guess !== 'string') {
      console.warn('Guess state is not a string, fixing:', guess, 'Type:', typeof guess, 'Stack:', new Error().stack);
      setGuessSafe(String(guess || ''));
    }
  }, [guess]);

  // Debug effect to track guess state changes
  useEffect(() => {
    console.log('Guess state changed:', guess, 'Type:', typeof guess);
  }, [guess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-yellow-800 to-indigo-900 flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
      {/* Confetti effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black/60" />
            <div className="relative bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-lg z-10">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-200 text-xl"
              >
                &times;
              </button>
              <GlobalLeaderboard />
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && currentReward && (
        <RewardModal
          rewardType={currentReward}
          onClose={() => setShowRewardModal(false)}
          stage={currentStage}
        />
      )}

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 bg-white/10 rounded-full backdrop-blur-sm"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [0, window.innerHeight],
              opacity: [1, 0],
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "loop",
              },
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-4">
        {showIntro ? (
          <IntroScreen
            playerName={playerName}
            googleName={googleName}
            onNameChange={setPlayerName}
            onStart={handleStartGame}
            isLoading={isLoading}
          />
        ) : (
          <GameSessionGuard>
            <div className="space-y-6 w-full">
              <GameHeader
                playerName={playerName}
                score={score}
                remainingTries={remainingTries}
                timer={timer}
                streak={streak}
                currentStage={currentStage}
                stageRequirements={gameConfig.stageRequirements}
              />

              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <EmojiCard
                    emoji={currentEmoji?.emoji || "🎲"}
                    key={currentEmoji?.id}
                  />

                  <GameControls
                    feedback={feedback}
                    showHint={showHint}
                    hintString={hintString}
                    guess={guess}
                    onGuessChange={setGuessSafe}
                    onGuessSubmit={handleGuess}
                    onHint={generateHint}
                    hintCount={hintCount}
                    onSkip={handleSkip}
                  />
                </>
              )}
            </div>
          </GameSessionGuard>
        )}
      </div>

      {/* Leaderboard button */}
      {!showIntro && (
        <button
          onClick={() => setShowLeaderboard(true)}
          className="fixed top-4 right-4 z-40 bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded-full shadow-lg transition-all"
        >
          View Leaderboard
        </button>
      )}

      {/* Top rank badge */}
      {userRank && userRank > 0 && userRank <= 3 && !showIntro && (
        <div className="fixed top-20 right-4 z-40 bg-green-500/90 text-white px-4 py-2 rounded-full shadow-lg text-lg font-bold border-2 border-green-300 animate-bounce">
          {userRank === 1 && "🥇 You are #1 on the Leaderboard!"}
          {userRank === 2 && "🥈 You are #2 on the Leaderboard!"}
          {userRank === 3 && "🥉 You are #3 on the Leaderboard!"}
        </div>
      )}
    </div>
  );
};
