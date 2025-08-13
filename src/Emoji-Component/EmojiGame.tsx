import {
  ClockIcon,
  GiftIcon,
  HeartIcon,
  LightBulbIcon,
  SparklesIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { GameSessionGuard } from "../Components/game/GameSessionGuard";
import GlobalLeaderboard from "../Components/utility/GlobalLeaderboard";
import { useAuthStore } from "../stores/authStore";
import { useSessionStore } from "../stores/sessionStore";
import { supabase } from "../supabaseClient";

type Emoji = {
  id: string;
  emoji: string;
  title: string;
  difficulty: number;
};

type RewardType = "free_game" | "coffee" | "cash_prize";

// Type for stage requirements from database
type StageRequirement = {
  id: number;
  stage_number: number;
  score: number;
  reward_type: RewardType;
};

const EmojiGame = () => {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();
  const { startSession } = useSessionStore();

  // State Management
  const [currentEmoji, setCurrentEmoji] = useState<Emoji | null>(null);
  const [guess, setGuess] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [remainingTries, setRemainingTries] = useState<number>(3);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [nextStageEmojis, setNextStageEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [hintCount, setHintCount] = useState<number>(3);
  const [currentReward, setCurrentReward] = useState<RewardType | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [hintString, setHintString] = useState<string>("");
  const [timer, setTimer] = useState<number>(30);
  const [playerName, setPlayerName] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<
    { player_name: string; score: number }[]
  >([]);
  const [userTotalPoints, setUserTotalPoints] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [topRank, setTopRank] = useState<number | null>(null);
  const [bonusGiven, setBonusGiven] = useState(false);
  // Dynamic reward thresholds and stage requirements
  const [rewardThresholds, setRewardThresholds] = useState<
    Record<string, number>
  >({});
  const [stageRequirements, setStageRequirements] = useState<
    Record<number, StageRequirement>
  >({});
  const [configLoaded, setConfigLoaded] = useState<boolean>(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [emojiGameTypeId, setEmojiGameTypeId] = useState<string | null>(null);

  // If user is authenticated, use their name and id
  const googleName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0];
  const googleId = user?.id;

  // Fetch configuration data with retry mechanism
  useEffect(() => {
    const fetchConfig = async (retryCount = 0) => {
      try {
        console.log(`🔄 Fetching configuration (attempt ${retryCount + 1})...`);
        
        // Fetch reward thresholds
        const { data: rewards, error: rewardsError } = await supabase
          .from("emoji_rewards")
          .select("*");

        if (rewardsError) {
          console.error("Error fetching rewards:", rewardsError);
        } else if (rewards) {
          const thresholds: Record<string, number> = {};
          rewards.forEach((r: any) => {
            thresholds[r.reward_type.toUpperCase()] = r.threshold;
          });
          setRewardThresholds(thresholds);
          console.log("✅ Rewards loaded:", Object.keys(thresholds).length);
        }

        // Fetch stage requirements
        const { data: stages, error: stagesError } = await supabase
          .from("emoji_stages")
          .select("*")
          .order("stage_number", { ascending: true });

        if (stagesError) {
          console.error("Error fetching stages:", stagesError);
          setConfigError("Failed to load stage requirements");
        } else if (stages) {
          const requirements: Record<number, StageRequirement> = {};
          stages.forEach((s: StageRequirement) => {
            requirements[s.stage_number] = s;
          });
          setStageRequirements(requirements);
          console.log("✅ Stage requirements loaded:", Object.keys(requirements).length);
        }

        // Fetch emoji game type ID
        const { data: gameTypeData, error: gameTypeError } = await supabase
          .from("game_types")
          .select("id")
          .eq("name", "emoji")
          .single();

        if (gameTypeError) {
          console.error("Error fetching emoji game type:", gameTypeError);
          if (gameTypeError.code === 'PGRST116') {
            const errorMsg = "Emoji game type not found. Please contact support to set up the game.";
            setConfigError(errorMsg);
            
            // Retry after 5 seconds if this is the first attempt
            if (retryCount === 0) {
              console.log("🔄 Retrying in 5 seconds...");
              setTimeout(() => fetchConfig(1), 5000);
              return;
            }
          } else {
            setConfigError("Failed to load game type configuration");
          }
        } else if (gameTypeData) {
          setEmojiGameTypeId(gameTypeData.id);
          console.log("✅ Emoji game type loaded:", gameTypeData.id);
        } else {
          setConfigError("Emoji game type not found in database");
        }

        // Mark configuration as loaded
        setConfigLoaded(true);
        console.log("✅ Configuration loading completed");
        
      } catch (error) {
        console.error("Error fetching configuration:", error);
        setConfigError("Failed to load configuration");
        setConfigLoaded(true);
      }
    };
    
    fetchConfig();
  }, []);

  // Fetch emojis with difficulty scaling
  const fetchEmojis = useCallback(async () => {
    setIsLoading(true);
    try {
      if (nextStageEmojis.length > 0 && currentStage === 2) {
        setEmojis(nextStageEmojis);
        selectRandomEmoji(nextStageEmojis);
      } else {
        const difficultyRange = [
          Math.max(1, currentStage - 1),
          Math.min(3, currentStage + 1),
        ];
        const { data, error } = await supabase
          .from("emojis")
          .select("*")
          .gte("difficulty", difficultyRange[0])
          .lte("difficulty", difficultyRange[1])
          .order("difficulty", { ascending: currentStage < 2 });
        if (error) throw error;
        if (data && data.length > 0) {
          setEmojis(data as Emoji[]);
          selectRandomEmoji(data as Emoji[]);
          // Pre-load next stage emojis
          preloadNextStageEmojis(currentStage + 1);
        } else {
          setFeedback("Failed to load emojis. Please try again.");
        }
      }
    } catch (error) {
      setFeedback("Failed to load emojis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentStage, nextStageEmojis]);

  const preloadNextStageEmojis = async (nextStage: number) => {
    // Get the maximum stage number dynamically
    const maxStage = Math.max(...Object.keys(stageRequirements).map(Number));
    if (nextStage > maxStage) return;
    const difficultyRange = [
      Math.max(1, nextStage - 1),
      Math.min(3, nextStage + 1),
    ];
    const { data } = await supabase
      .from("emojis")
      .select("*")
      .gte("difficulty", difficultyRange[0])
      .lte("difficulty", difficultyRange[1])
      .limit(20);
    setNextStageEmojis((data || []) as Emoji[]);
  };

  const selectRandomEmoji = (emojiList: Emoji[]) => {
    if (emojiList.length === 0) {
      setGameOver(true);
      return;
    }
    const randomIndex = Math.floor(Math.random() * emojiList.length);
    const randomEmoji = emojiList[randomIndex];
    setCurrentEmoji(randomEmoji);
    setGuess("");
    setShowHint(false);
    setFeedback(null);
    setHintString("");
    setTimer(30);
  };

  const handleGuess = async () => {
    if (!currentEmoji || !guess.trim()) return;
    const userGuess = guess.toLowerCase().trim();
    const correctAnswer = currentEmoji.title.toLowerCase().trim();
    const isCorrect = userGuess === correctAnswer;
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      setFeedback(`Correct! 🎉 The answer is "${currentEmoji.title}".`);
      // Check for stage completion and rewards
      const stageRequirement = stageRequirements[currentStage];
      if (
        stageRequirement &&
        newScore >= stageRequirement.score &&
        configLoaded
      ) {
        setCurrentReward(stageRequirement.reward_type as RewardType);
        // Update player progress
        try {
          const { data: progress } = await supabase
            .from("emoji_player_progress")
            .select("*")
            .eq("player_id", playerId)
            .single();
          if (progress) {
            const availableStages = Object.keys(stageRequirements)
              .map(Number)
              .sort((a, b) => a - b);
            const currentStageIndex = availableStages.indexOf(
              progress.current_stage
            );
            const nextStageIndex = Math.min(
              availableStages.length - 1,
              currentStageIndex + 1
            );
            const newStage = availableStages[nextStageIndex];
            if (
              newStage &&
              newStage >= 1 &&
              newStage <= Math.max(...availableStages)
            ) {
              setCurrentStage(newStage);
            }
            await supabase
              .from("emoji_player_progress")
              .update({
                total_wins: progress.total_wins + 1,
                last_win: new Date().toISOString(),
                rewards_claimed: [
                  ...progress.rewards_claimed,
                  stageRequirement.reward_type,
                ],
                current_stage: newStage,
                sessions_played: progress.sessions_played + 1,
              })
              .eq("player_id", playerId);
            setCurrentStage(newStage);
            fetchEmojis();
          }
          await supabase.from("emoji_certificates").insert({
            player_name: playerName,
            player_id: playerId,
            game_type: "emoji",
            score: newScore,
            reward_type: stageRequirement.reward_type,
            timestamp: new Date().toISOString(),
            session_id: sessionId,
          });
        } catch (error) {
          console.error("Error updating progress:", error);
        }
      }
      const updatedEmojis = emojis.filter(
        (emoji) => emoji.id !== currentEmoji.id
      );
      setEmojis(updatedEmojis);
      // Only show next emoji after user action (not automatically)
      // User must click a button to continue
    } else {
      const newTries = remainingTries - 1;
      setRemainingTries(newTries);
      setStreak(0);
      setFeedback("Incorrect! 😢 Try again.");
      if (newTries <= 0) {
        setGameOver(true);
        await saveScore();
        // Navigation is now handled by the gameOver effect
      }
    }
    setGuess("");
  };

  const generateHint = () => {
    if (hintCount > 0 && currentEmoji) {
      const titleWords = currentEmoji.title.split(" ");
      const lastWord = titleWords.pop();
      const hint = `______ ${lastWord}`;
      setHintString(hint);
      setShowHint(true);
      setHintCount((prev) => prev - 1);
    }
  };

  const saveScore = async () => {
    try {
      // Try to get game type ID if not already loaded
      let gameTypeId = emojiGameTypeId;
      
      if (!gameTypeId) {
        console.log("Game type ID not loaded, attempting to fetch...");
        const { data: gameTypeData, error: gameTypeError } = await supabase
          .from("game_types")
          .select("id")
          .eq("name", "emoji")
          .single();
        
        if (gameTypeError || !gameTypeData) {
          console.error("Failed to fetch emoji game type:", gameTypeError);
          console.error("Cannot save score without game type ID");
          setFeedback("Error: Game configuration not loaded. Please refresh and try again.");
          return;
        }
        
        gameTypeId = gameTypeData.id;
        setEmojiGameTypeId(gameTypeId);
        console.log("Fetched game type ID:", gameTypeId);
      }

      const scoreData = {
        player_name: playerName,
        player_id: playerId,
        score: score,
        game_type_id: gameTypeId,
        stage: currentStage,
        session_id: sessionId,
        streak: maxStreak,
        timestamp: new Date().toISOString(),
      };

      console.log("Saving score data:", scoreData);
      
      const { data, error } = await supabase.from("emoji_scores").insert(scoreData);
      
      if (error) {
        console.error("Error saving score:", error);
        
        // Provide user-friendly error message
        if (error.code === '23503') {
          setFeedback("Error: Database constraint violation. Please contact support.");
        } else if (error.code === '42501') {
          setFeedback("Error: Permission denied. Please refresh and try again.");
        } else {
          setFeedback("Error saving score. Please try again.");
        }
        
        throw error;
      }
      
      console.log("Score saved successfully:", data);
      setFeedback("Score saved successfully!");
    } catch (error) {
      console.error("Error saving score:", error);
      if (!feedback) {
        setFeedback("Failed to save score. Please try again.");
      }
    }
  };

  const handleSkip = () => {
    if (remainingTries > 1) {
      setRemainingTries((prev) => prev - 1);
      setFeedback("Skipped! Next emoji.");
      // Only show next emoji after user action (not automatically)
      // User must click a button to continue
    } else {
      setFeedback("No lives left to skip!");
      setGameOver(true);
    }
  };
  // Add a button to continue to the next emoji after correct guess or skip
  const handleNextEmoji = () => {
    const updatedEmojis = emojis.filter(
      (emoji) => emoji.id !== currentEmoji?.id
    );
    setEmojis(updatedEmojis);
    selectRandomEmoji(updatedEmojis);
    setHintCount(3);
    setFeedback(null);
    setShowHint(false);
    setHintString("");
  };

  const handleStartGame = async () => {
    let nameToUse = playerName;
    let idToUse = playerId;
    if (user && googleName && googleId) {
      nameToUse = googleName;
      idToUse = googleId;
      setPlayerName(googleName);
      setPlayerId(googleId);
      console.log("Using authenticated user:", { name: nameToUse, id: idToUse });
    } else {
      if (!playerName || playerName.trim().length < 3) {
        setFeedback("Please enter a name with at least 3 characters");
        return;
      }
      const newPlayerId = uuidv4();
      setPlayerId(newPlayerId);
      idToUse = newPlayerId;
      console.log("Using anonymous user:", { name: nameToUse, id: idToUse });
    }
    const newSessionId = uuidv4();
    setSessionId(newSessionId);

    // Start game session
    try {
      await startSession("emoji-game", nameToUse, 1800); // 30 minutes
    } catch (error) {
      console.error("Failed to start game session:", error);
    }

    // Initialize player progress
    supabase.from("emoji_player_progress").upsert(
      {
        player_id: idToUse,
        current_stage: 1,
        sessions_played: 0,
      },
      { onConflict: "player_id" }
    );
    setShowIntro(false);
    fetchEmojis();
  };

  const handleRestartGame = () => {
    setScore(0);
    setRemainingTries(3);
    setGameOver(false);
    setCurrentReward(null);
    setStreak(0);
    setMaxStreak(0);
    fetchEmojis();
  };

  const handleBackToMenu = () => {
    navigate("/");
  };

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!showIntro && !gameOver && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !gameOver) {
      setFeedback("Time is up! Game Over!");
      setGameOver(true);
      saveScore();
    }
    return () => clearInterval(interval);
  }, [timer, showIntro, gameOver]);

  // Effect to handle game over and navigation
  useEffect(() => {
    if (gameOver) {
      console.log("🎮 Game over detected, preparing to navigate...");
      console.log("📊 Final game state:", {
        sessionId,
        playerId,
        playerName,
        score,
        timestamp: new Date().toISOString()
      });
      
      // Small delay to ensure saveScore completes
      const timer = setTimeout(() => {
        console.log("🚀 Navigating to game result page...");
        navigate("/game-result", {
          state: {
            sessionId: sessionId,
            playerId: playerId,
            playerName: playerName,
            gameType: "Emoji Game",
            score: score,
            timestamp: new Date().toISOString(),
          },
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameOver, sessionId, playerId, playerName, score, navigate]);

  // Initialize player progress on mount
  useEffect(() => {
    if (!showIntro) {
      fetchEmojis();
    }
  }, [showIntro, fetchEmojis]);

  // Validate current stage when configuration loads
  useEffect(() => {
    if (configLoaded && Object.keys(stageRequirements).length > 0) {
      const availableStages = Object.keys(stageRequirements)
        .map(Number)
        .sort((a, b) => a - b);
      if (
        availableStages.length > 0 &&
        !availableStages.includes(currentStage)
      ) {
        // Set to the first available stage if current stage is invalid
        setCurrentStage(availableStages[0]);
      }
    }
  }, [configLoaded, stageRequirements, currentStage]);

  // Fetch leaderboard and user total points after game over
  useEffect(() => {
    if (gameOver) {
      // Fetch top 10 scores
      supabase
        .from("emoji_scores")
        .select("player_name, score")
        .order("score", { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setLeaderboard(data);
        });
      // Fetch user's total points
      if (playerId) {
        supabase
          .from("emoji_scores")
          .select("score")
          .eq("player_id", playerId)
          .then(({ data }) => {
            if (data) {
              const total = data.reduce(
                (sum, row) => sum + (row.score || 0),
                0
              );
              setUserTotalPoints(total);
            }
          });
      }
    }
  }, [gameOver, playerId]);

  // Grant bonus points at the start of a new game session if in top 3
  useEffect(() => {
    const grantBonusIfNeeded = async () => {
      if (
        !showIntro &&
        topRank &&
        topRank > 0 &&
        topRank <= 3 &&
        !bonusGiven &&
        playerId &&
        sessionId
      ) {
        try {
          const token = session?.access_token;
          const response = await fetch("/api/leaderboard/bonus", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ playerId, sessionId, gameType: "emoji" }),
          });
          if (response.ok) {
            setScore((prev) => prev + 10);
            setBonusGiven(true);
          } else {
            // If already granted or not eligible, just set as given to avoid spamming
            setBonusGiven(true);
          }
        } catch (e) {
          setBonusGiven(true);
        }
      }
      if (showIntro) {
        setBonusGiven(false); // Reset for next session
      }
    };
    grantBonusIfNeeded();
  }, [
    showIntro,
    topRank,
    bonusGiven,
    playerId,
    playerName,
    sessionId,
    currentStage,
    session,
  ]);

  // Reward icon component
  const RewardIcon = ({ rewardType }: { rewardType: RewardType }) => {
    switch (rewardType) {
      case "free_game":
        return <GiftIcon className="w-6 h-6 text-blue-400 animate-pulse" />;
      case "coffee":
        return <GiftIcon className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case "cash_prize":
        return <TrophyIcon className="w-6 h-6 text-green-400 animate-pulse" />;
      default:
        return (
          <SparklesIcon className="w-6 h-6 text-purple-400 animate-pulse" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-yellow-800 to-indigo-900 flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
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
              <GlobalLeaderboard
                onTopRank={(rank) =>
                  setTopRank(rank > 0 && rank <= 3 ? rank : null)
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 bg-white/10 rounded-full backdrop-blur-sm"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 800),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 600),
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [0, typeof window !== "undefined" ? window.innerHeight : 600],
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
          <motion.div
            className="w-full bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 p-4 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-transparent bg-clip-text">
                Emoji Mastermind
              </h1>
              <p className="text-sm sm:text-base text-white/80 font-light">
                Crack the emoji enigma! Use your wits to decipher hidden
                phrases. Earn rewards and climb the leaderboards 🏆
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="space-y-3 mb-4">
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                  <div className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                    <SparklesIcon className="w-4 h-4 text-amber-400" />
                    <span>Stage-based Rewards</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                    <ClockIcon className="w-4 h-4 text-amber-400" />
                    <span>Timed Challenges</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-amber-400">
                  Enter Your Name
                </h3>
                {user && googleName ? (
                  <div className="text-white text-lg font-semibold flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-amber-400" />
                    {googleName}
                  </div>
                ) : (
                  <input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    required
                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-center text-base focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-white/40"
                  />
                )}
                <p className="text-xs text-white/60">
                  Your name will be used for the leaderboard
                </p>
              </div>
            </div>

            {configError && (
              <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-500/20">
                {configError}
              </div>
            )}

            <motion.button
              onClick={handleStartGame}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={
                !user || !googleName
                  ? !playerName.trim() || !configLoaded || !!configError
                  : !configLoaded || !!configError
              }
              className={`w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl text-base font-semibold ${
                !configLoaded || !!configError || (!user && !playerName.trim())
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {configError
                ? "Configuration Error"
                : !configLoaded
                ? "Loading Configuration..."
                : "Start Challenge 🚀"}
            </motion.button>
          </motion.div>
        ) : (
          <GameSessionGuard>
            <div className="space-y-6">
              {/* Game Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
                <div className="text-base font-semibold text-amber-400">
                  Player: {playerName || "Guest"}
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    <span className="text-amber-400">⭐ {score}</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                    <HeartIcon className="w-4 h-4 text-rose-400" />
                    <span>{remainingTries}</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    ⏳ {timer}s
                  </div>
                  {streak > 0 && (
                    <div className="bg-green-500/20 px-3 py-1 rounded-full text-sm text-green-300">
                      🔥 {streak}
                    </div>
                  )}
                </div>
              </div>

              {/* Stage progress */}
              {configLoaded && stageRequirements[currentStage] ? (
                <div className="mb-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      animate={{
                        width: `${Math.min(
                          100,
                          (score / stageRequirements[currentStage].score) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-white/70 text-xs mt-1 text-right">
                    Stage {currentStage}: {score}/
                    {stageRequirements[currentStage].score}
                  </p>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-2 bg-white/20 animate-pulse" />
                  </div>
                  <p className="text-white/70 text-xs mt-1 text-right">
                    Loading stage configuration...
                  </p>
                </div>
              )}

              {/* Emoji Display */}
              <motion.div
                className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center justify-center"
                key={currentEmoji?.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-6xl sm:text-8xl">
                  {currentEmoji?.emoji || "🎲"}
                </span>
              </motion.div>

              {/* Game Controls */}
              <div className="space-y-6">
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`px-6 py-3 rounded-xl text-center border ${
                        feedback.includes("Correct")
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {feedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {showHint && (
                    <div className="bg-white/10 px-4 py-2 rounded-lg text-sm border border-white/20">
                      Hint: {hintString}
                    </div>
                  )}
                  <input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleGuess()}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-white/40"
                    disabled={!!feedback && feedback.includes("Correct")}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={generateHint}
                      disabled={
                        showHint ||
                        hintCount === 0 ||
                        (!!feedback && feedback.includes("Correct"))
                      }
                      className="py-2.5 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded-xl flex items-center justify-center gap-1"
                    >
                      <LightBulbIcon className="w-4 h-4" />
                      Hint ({hintCount})
                    </button>
                    <button
                      onClick={handleSkip}
                      disabled={!!feedback && feedback.includes("Correct")}
                      className="py-2.5 text-sm bg-white/5 hover:bg-white/10 rounded-xl"
                    >
                      Skip ➔
                    </button>
                  </div>

                  <button
                    onClick={handleGuess}
                    disabled={!!feedback && feedback.includes("Correct")}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl text-sm font-semibold"
                  >
                    Submit Answer
                  </button>

                  {/* Show Next button only after correct guess or skip */}
                  {((!!feedback && feedback.includes("Correct")) ||
                    feedback === "Skipped! Next emoji.") && (
                    <button
                      onClick={handleNextEmoji}
                      className="w-full py-3 mt-2 bg-green-500 rounded-xl text-sm font-semibold text-white"
                    >
                      Next Emoji
                    </button>
                  )}
                </div>
              </div>
            </div>
          </GameSessionGuard>
        )}
      </div>

      {/* View Global Leaderboard button */}
      <button
        onClick={() => setShowLeaderboard(true)}
        className="fixed top-4 right-4 z-40 bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded-full shadow-lg transition-all"
      >
        View Global Leaderboard
      </button>

      {/* Top 3 Badge */}
      {topRank && topRank > 0 && topRank <= 3 && (
        <div className="fixed top-20 right-4 z-40 bg-green-500/90 text-white px-4 py-2 rounded-full shadow-lg text-lg font-bold border-2 border-green-300 animate-bounce">
          {topRank === 1 && "🥇 You are #1 on the Global Leaderboard!"}
          {topRank === 2 && "🥈 You are #2 on the Global Leaderboard!"}
          {topRank === 3 && "🥉 You are #3 on the Global Leaderboard!"}
        </div>
      )}

      {/* Bonus Points Message */}
      {topRank && topRank > 0 && topRank <= 3 && bonusGiven && !showIntro && (
        <div className="fixed top-36 right-4 z-40 bg-yellow-500/90 text-indigo-900 px-4 py-2 rounded-full shadow-lg text-lg font-bold border-2 border-yellow-300 animate-bounce">
          +10 Bonus Points for Top 3 Leaderboard!
        </div>
      )}
    </div>
  );
};

export default EmojiGame;
