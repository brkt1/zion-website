import { useState } from "react";
import { FaDice, FaRedo } from "react-icons/fa";

interface DiceResult {
  value: number;
  rolling: boolean;
}

// Component to render dice face with dots for 6-sided dice
const DiceFace = ({ value, sides, rolling }: { value: number; sides: number; rolling: boolean }) => {
  // For 6-sided dice, show dot patterns
  if (sides === 6 && value > 0) {
    const dotPatterns: { [key: number]: string[] } = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };

    const dots = dotPatterns[value] || [];

    return (
      <div className="relative w-full h-full">
        {dots.map((position, index) => (
          <div
            key={index}
            className={`absolute w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white ${
              position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              position === 'top-left' ? 'top-2 left-2' :
              position === 'top-right' ? 'top-2 right-2' :
              position === 'bottom-left' ? 'bottom-2 left-2' :
              position === 'bottom-right' ? 'bottom-2 right-2' :
              position === 'middle-left' ? 'top-1/2 left-2 -translate-y-1/2' :
              position === 'middle-right' ? 'top-1/2 right-2 -translate-y-1/2' :
              ''
            }`}
          />
        ))}
      </div>
    );
  }

  // For other dice types, show the number
  return (
    <span className="text-white font-bold text-xl sm:text-2xl md:text-3xl">
      {value > 0 ? value : '?'}
    </span>
  );
};

const DiceRoller = () => {
  const [diceCount, setDiceCount] = useState(1);
  const [diceSides, setDiceSides] = useState(6);
  const [results, setResults] = useState<DiceResult[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<number[]>([]);

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setResults([]);
    setTotal(null);

    // Create initial rolling state
    const rollingDice: DiceResult[] = Array.from({ length: diceCount }, () => ({
      value: 0,
      rolling: true,
    }));
    setResults(rollingDice);

    // Simulate rolling animation
    const rollDuration = 1000;
    const rollInterval = 50;
    let elapsed = 0;

    const rollAnimation = setInterval(() => {
      elapsed += rollInterval;
      const newResults: DiceResult[] = rollingDice.map(() => ({
        value: Math.floor(Math.random() * diceSides) + 1,
        rolling: true,
      }));
      setResults(newResults);

      if (elapsed >= rollDuration) {
        clearInterval(rollAnimation);
        
        // Final roll
        const finalResults: DiceResult[] = Array.from({ length: diceCount }, () => ({
          value: Math.floor(Math.random() * diceSides) + 1,
          rolling: false,
        }));
        
        setResults(finalResults);
        const sum = finalResults.reduce((acc, die) => acc + die.value, 0);
        setTotal(sum);
        setIsRolling(false);
        
        // Add to history
        setRollHistory(prev => [sum, ...prev].slice(0, 10));
      }
    }, rollInterval);
  };

  const reset = () => {
    setResults([]);
    setTotal(null);
    setRollHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col pb-40 md:pb-8">
      {/* Header - Compact on mobile */}
      <div className="text-center pt-4 pb-4 md:pt-8 md:pb-6 px-4">
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 tracking-tight"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Dice Roller
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Roll virtual dice for your games
        </p>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="container mx-auto max-w-4xl">
          {/* Results - Top Priority */}
          {results.length > 0 ? (
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg border border-gray-100 mt-4 md:mt-6">
              {/* Dice Display */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-4 md:mb-6">
                {results.map((result, index) => (
                  <div
                    key={`${index}-${result.value}-${result.rolling}`}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      result.rolling ? "dice-rolling" : "dice-settled"
                    }`}
                    style={{
                      background: result.rolling
                        ? "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)"
                        : "linear-gradient(135deg, #FF6F5E 0%, #FFD447 100%)",
                      boxShadow: result.rolling
                        ? "0 8px 25px rgba(255, 111, 94, 0.5)"
                        : "0 4px 15px rgba(255, 111, 94, 0.3)",
                    }}
                  >
                    <DiceFace value={result.value} sides={diceSides} rolling={result.rolling} />
                  </div>
                ))}
              </div>

              {/* Total */}
              {total !== null && (
                <div className="text-center">
                  <div 
                    className="h-0.5 w-12 md:w-16 mx-auto mb-3 md:mb-4 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                    }}
                  ></div>
                  <p className="text-gray-600 mb-1 md:mb-2 text-sm md:text-base font-semibold">Total</p>
                  <p 
                    className="text-3xl sm:text-4xl md:text-5xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {total}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Empty State - Show when no results */
            <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 mb-4 md:mb-6 shadow-lg border border-gray-100 text-center mt-4 md:mt-6">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 212, 71, 0.2) 0%, rgba(255, 111, 94, 0.2) 100%)",
                }}
              >
                <FaDice size={48} style={{ color: "#FF6F5E" }} />
              </div>
              <p className="text-gray-600 text-sm md:text-base">
                Configure your dice below and roll to see results here
              </p>
            </div>
          )}

          {/* Roll History */}
          {rollHistory.length > 0 && (
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg border border-gray-100">
              <h2 
                className="text-lg md:text-xl font-bold mb-3 md:mb-4"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Recent Rolls
              </h2>
              <div className="flex flex-wrap gap-2">
                {rollHistory.map((roll, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-full font-semibold text-sm md:text-base"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 212, 71, 0.2) 0%, rgba(255, 111, 94, 0.2) 100%)",
                      color: "#C73A26",
                      border: "1px solid rgba(255, 111, 94, 0.3)",
                    }}
                  >
                    {roll}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls - Fixed at Bottom on Mobile (above mobile nav) */}
      <div className="fixed bottom-24 md:bottom-0 left-0 right-0 md:relative md:bottom-auto bg-white border-t md:border-t-0 md:border border-gray-200 md:rounded-2xl md:rounded-t-none md:shadow-lg z-50">
        <div className="container mx-auto max-w-4xl px-4 py-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Number of Dice */}
            <div>
              <label 
                className="block text-xs md:text-sm font-semibold mb-2"
                style={{ color: "#C73A26" }}
              >
                Number of Dice
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                  disabled={isRolling || diceCount <= 1}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full font-bold text-white text-sm md:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={diceCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setDiceCount(Math.max(1, Math.min(10, val)));
                  }}
                  disabled={isRolling}
                  className="flex-1 text-center text-xl md:text-2xl font-bold border-2 rounded-lg py-2 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                  style={{
                    borderColor: "#FF6F5E",
                  }}
                />
                <button
                  onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
                  disabled={isRolling || diceCount >= 10}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full font-bold text-white text-sm md:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Dice Sides */}
            <div>
              <label 
                className="block text-xs md:text-sm font-semibold mb-2"
                style={{ color: "#C73A26" }}
              >
                Sides per Die
              </label>
              <select
                value={diceSides}
                onChange={(e) => setDiceSides(parseInt(e.target.value))}
                disabled={isRolling}
                className="w-full text-center text-base md:text-lg font-bold border-2 rounded-lg py-2.5 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                style={{
                  borderColor: "#FF6F5E",
                }}
              >
                <option value={4}>4-sided (d4)</option>
                <option value={6}>6-sided (d6)</option>
                <option value={8}>8-sided (d8)</option>
                <option value={10}>10-sided (d10)</option>
                <option value={12}>12-sided (d12)</option>
                <option value={20}>20-sided (d20)</option>
                <option value={100}>100-sided (d100)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={rollDice}
              disabled={isRolling}
              className="flex-1 flex items-center justify-center gap-2 md:gap-3 py-3.5 md:py-4 px-6 rounded-full font-semibold text-white text-base md:text-lg transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 md:hover:scale-105 md:hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                boxShadow: "0 4px 20px rgba(255, 111, 94, 0.3)",
              }}
            >
              <FaDice size={18} className={isRolling ? "animate-spin" : ""} />
              <span>{isRolling ? "Rolling..." : "Roll Dice"}</span>
            </button>
            <button
              onClick={reset}
              disabled={isRolling || results.length === 0}
              className="flex items-center justify-center gap-2 md:gap-3 py-3.5 md:py-4 px-6 rounded-full font-semibold text-sm md:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 md:hover:scale-105 border-2"
              style={{
                borderColor: "#FF6F5E",
                color: "#C73A26",
              }}
            >
              <FaRedo size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dice Rolling Animation Styles */}
      <style>{`
        @keyframes dice-roll {
          0% {
            transform: scale(1.1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateX(0) translateY(0);
          }
          25% {
            transform: scale(1.1) rotateX(90deg) rotateY(90deg) rotateZ(0deg) translateX(-3px) translateY(3px);
          }
          50% {
            transform: scale(1.1) rotateX(180deg) rotateY(180deg) rotateZ(90deg) translateX(3px) translateY(-3px);
          }
          75% {
            transform: scale(1.1) rotateX(270deg) rotateY(270deg) rotateZ(180deg) translateX(-3px) translateY(-3px);
          }
          100% {
            transform: scale(1.1) rotateX(360deg) rotateY(360deg) rotateZ(270deg) translateX(0) translateY(0);
          }
        }

        .dice-rolling {
          animation: dice-roll 0.15s linear infinite;
          transform-style: preserve-3d;
        }

        .dice-settled {
          animation: none;
          transform: scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
        }
      `}</style>
    </div>
  );
};

export default DiceRoller;

