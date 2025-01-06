import React from "react";
import { useNavigate } from "react-router-dom";

const Lovers = () => {
  const navigate = useNavigate();

  const onSelectCategory = (category, subtype) => {
    navigate("/game-mode", { state: { category, subtype } });
  };

  const handleBackButtonClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-950 to-gray-900 flex flex-col justify-center items-center text-white">
      {/* Photo */}
      <img 
        src="image 1.png" 
        alt="A romantic scene representing lovers" 
        className="w-30 h-auto object-cover mb-12" 
      />

      {/* Buttons */}
      <div className="flex flex-col gap-6 w-3/4 md:w-1/2 lg:w-1/3">
        {/* Normal Button */}
        <button
          className="bg-gray-900 border-2 border-red-500 hover:bg-gray-700 text-white py-3 rounded-lg text-lg font-semibold shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
          onClick={() => onSelectCategory("Love", "Normal")}
          aria-label="Select Normal Love Questions"
        >
          Normal
        </button>

        {/* Romantic Button */}
        <button
          className="bg-gray-900 border-2 border-red-500 hover:bg-gray-800 text-white py-3 rounded-lg text-lg font-semibold shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
          onClick={() => onSelectCategory("Love", "Romantic")}
          aria-label="Select Romantic Love Questions"
        >
          Romantic
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={handleBackButtonClick}
        className="mt-6 py-2 px-4 bg-gray-900 border-2 border-red-500 hover:bg-gray-800 text-white rounded-lg transition-all"
        aria-label="Go back to the previous page"
      >
        Back
      </button>

      <footer className="text-gray-600 text-[50px] md:text-4xl pt-12">
        Mavka
      </footer>
    </div>
  );
};

export default Lovers;