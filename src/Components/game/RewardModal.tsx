import React from "react";

interface RewardModalProps {
  rewardType: string;
  onClose: () => void;
  stage: number;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  rewardType,
  onClose,
  stage,
}) => (
  <div className="reward-modal fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">Stage {stage} Complete!</h2>
      <div className="text-xl mb-4">
        You've earned:{" "}
        <span className="font-bold text-yellow-500">{rewardType}</span>
      </div>
      <button
        onClick={onClose}
        className="bg-indigo-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
);
