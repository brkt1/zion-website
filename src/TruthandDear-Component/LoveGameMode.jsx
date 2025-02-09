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
      if (!type) return; // Wait for user to choose Truth or Dare

      setLoading(true);

      if (!type || !subtypeState) {
        setCurrentQuestion({ content: "Select a valid configuration" });
        setLoading(false);
        return;
      }

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
        // Reset if all questions have been asked
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

    // Reset type to prompt "Truth or Dare" again
    setType(null);
  };

  const renderTypeButton = (buttonType) => {
    const isActive = type === buttonType;
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-bold transition-all duration-300 
          ${
            buttonType === "Truth"
              ? isActive
                ? "bg-blue-600 text-white"
                : "bg-blue-900/50 text-blue-300"
              : isActive
              ? "bg-red-600 text-white"
              : "bg-red-900/50 text-red-300"
          }`}
        onClick={() => setType(buttonType)}
      >
        {buttonType === "Truth" ? <FaHeart /> : <FaFire />}
        <span>{buttonType}</span>
      </motion.button>
    );
  };

  const renderSubtypeButton = (subtypeOption) => {
    const isActive = subtypeState === subtypeOption;
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-bold transition-all duration-300 
          ${
            subtypeOption === "Normal"
              ? isActive
                ? "bg-green-600 text-white"
                : "bg-green-900/50 text-green-300"
              : isActive
              ? "bg-pink-600 text-white"
              : "bg-pink-900/50 text-pink-300"
          }`}
        onClick={() => setSubtype(subtypeOption)}
      >
        {subtypeOption === "Normal" ? <FaDice /> : <FaHeart />}
        <span>{subtypeOption}</span>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md sm:max-w-xl bg-gray-800/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-700/30 p-4 sm:p-8 space-y-4 sm:space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <motion.h2 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500"
          >
            Lover Game Mode
          </motion.h2>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm sm:text-base"
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>
        </div>

        {/* Type and Subtype Selectors */}
        <div className="space-y-4 sm:space-y-6">
          {type === null && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center space-x-2 sm:space-x-4"
            >
              {renderTypeButton("Truth")}
              {renderTypeButton("Dare")}
            </motion.div>
          )}

          {type && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center space-x-2 sm:space-x-4"
            >
              {renderSubtypeButton("Normal")}
              {renderSubtypeButton("Romantic")}
            </motion.div>
          )}
        </div>

        {/* Question Display */}
        <AnimatePresence mode="wait">
        {type && currentQuestion && (
            <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-purple-900/50 to-gray-800/50 rounded-xl p-4 sm:p-8 min-h-[200px] sm:min-h-[250px] flex items-center justify-center text-center text-lg sm:text-2xl font-semibold"
            >
            {loading ? <loading /> : currentQuestion.content}
            </motion.div>
        )}
        </AnimatePresence>

        {/* Next Question Button */}
        {type && (
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextQuestion}
              disabled={loading || !currentQuestion}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold 
              hover:from-pink-700 hover:to-purple-700 transition-all duration-300 
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FaDice />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoverGameMode;
