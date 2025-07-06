import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaFire, FaArrowLeft, FaDice } from "react-icons/fa";
import { supabase } from "../supabaseClient";

const LoverGameMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subtype } = location.state || {};

  const [type, setType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subtypeState, setSubtype] = useState(subtype || "Normal");
  const [questionHistory, setQuestionHistory] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!type) return;

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .ilike("type", type)
          .ilike("subtype", subtypeState);

        if (error) throw error;

        if (data.length === 0) {
          setCurrentQuestion({ content: "No questions found. Try different settings." });
        } else {
          setQuestions(data);
          const firstQuestion = data[Math.floor(Math.random() * data.length)];
          setCurrentQuestion(firstQuestion);
          setQuestionHistory([firstQuestion]);
        }
      } catch (err) {
        console.error("Error:", err);
        setCurrentQuestion({ content: "Failed to load questions" });
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [type, subtypeState]);

  const nextQuestion = () => {
    if (questions.length > 0) {
      const availableQuestions = questions.filter(
        q => !questionHistory.some(history => history.id === q.id)
      );

      if (availableQuestions.length === 0) {
        setQuestionHistory([]);
        const newQuestion = questions[Math.floor(Math.random() * questions.length)];
        setCurrentQuestion(newQuestion);
        setQuestionHistory([newQuestion]);
      } else {
        const nextQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        setCurrentQuestion(nextQ);
        setQuestionHistory(prev => [...prev, nextQ]);
      }
    }
    setType(null);
  };

  const renderTypeButton = (buttonType) => {
    const isActive = type === buttonType;
    return (
      <motion.button
        whileHover={{ scale: 1.1, rotate: 1 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-lg font-bold transition-all duration-300 
          ${
            buttonType === "Truth"
              ? isActive
                ? "bg-gradient-to-r from-amber-400 to-amber-600 shadow-gold"
                : "bg-amber-900/50 text-amber-300 hover:bg-amber-800/60"
              : isActive
              ? "bg-gradient-to-r from-rose-500 to-pink-600 shadow-neon"
              : "bg-pink-900/50 text-pink-300 hover:bg-pink-800/60"
          }`}
        onClick={() => setType(buttonType)}
      >
        {buttonType === "Truth" ? (
          <FaHeart className="text-amber-200" />
        ) : (
          <FaFire className="text-pink-200" />
        )}
        <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          {buttonType}
        </span>
      </motion.button>
    );
  };

  const renderSubtypeButton = (subtypeOption) => {
    const isActive = subtypeState === subtypeOption;
    return (
      <motion.button
        whileHover={{ scale: 1.1, rotate: -1 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-lg font-bold transition-all duration-300 
          ${
            subtypeOption === "Normal"
              ? isActive
                ? "bg-gradient-to-r from-cyan-400 to-blue-600 shadow-neon"
                : "bg-cyan-900/50 text-cyan-300 hover:bg-cyan-800/60"
              : isActive
              ? "bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-neon"
              : "bg-purple-900/50 text-purple-300 hover:bg-purple-800/60"
          }`}
        onClick={() => setSubtype(subtypeOption)}
      >
        {subtypeOption === "Normal" ? (
          <FaDice className="text-cyan-200" />
        ) : (
          <FaHeart className="text-purple-200" />
        )}
        <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          {subtypeOption}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900  to-black text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-2xl bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-amber-400/30 p-6 sm:p-8 space-y-6"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h2 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 font-['Bebas_Neue'] tracking-wide"
          >
            Hello! Pleas choose 
          </motion.h2>
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <FaArrowLeft className="text-xl" />
            <span className="font-semibold">Back</span>
          </motion.button>
        </div>

        <div className="space-y-8">
          {type === null && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-4 flex-wrap"
            >
              {renderTypeButton("Truth")}
              {renderTypeButton("Dare")}
            </motion.div>
          )}

          {type && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-4 flex-wrap"
            >
              {renderSubtypeButton("Normal")}
              {renderSubtypeButton("Romantic")}
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {type && currentQuestion && (
            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="bg-gradient-to-br from-amber-900/40 to-gray-800/40 rounded-xl p-8 min-h-[250px] flex items-center justify-center text-center text-2xl font-semibold border-2 border-amber-400/20"
            >
              <p className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                {loading ? 'Loading...' : currentQuestion.content}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {type && (
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextQuestion}
              disabled={loading || !currentQuestion}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-4 rounded-2xl text-lg font-bold 
                hover:shadow-2xl transition-all duration-300 
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3
                shadow-gold"
            >
              <FaDice className="text-2xl text-amber-100" />
              <span>Next Challenge</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoverGameMode;