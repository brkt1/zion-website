export const DurationBar = ({
  duration,
  max,
}: {
  duration: number;
  max: number;
}) => {
  const percentage = Math.min(100, (duration / max) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>0</span>
        <span>{duration} min</span>
        <span>{max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-yellow-500 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
