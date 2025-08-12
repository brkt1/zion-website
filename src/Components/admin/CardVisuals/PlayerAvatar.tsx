export const PlayerAvatar = ({
  name,
  position,
}: {
  name: string;
  position: string;
}) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("")
    : "";

  // Position-based color coding
  const positionColors: Record<string, string> = {
    Goalkeeper: "bg-red-500",
    Defender: "bg-blue-500",
    Midfielder: "bg-green-500",
    Forward: "bg-yellow-500",
  };

  const bgColor = positionColors[position] || "bg-gray-600";

  return (
    <div
      className={`relative w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}
    >
      <span className="font-bold text-white text-sm">{initials}</span>
      <div className="absolute -bottom-1 -right-1 bg-black-primary rounded-full w-4 h-4 flex items-center justify-center border border-yellow-500">
        <span className="text-[8px] text-white">{position ? position[0] : ''}</span>
      </div>
    </div>
  );
};
