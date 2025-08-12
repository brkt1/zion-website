const rarityColors: Record<string, string> = {
  common: "bg-gray-400 text-gray-900",
  uncommon: "bg-green-500 text-white",
  rare: "bg-blue-500 text-white",
  epic: "bg-purple-500 text-white",
  legendary: "bg-yellow-500 text-black",
};

export const RarityBadge = ({ rarity }: { rarity: string }) => {
  const colorClass =
    rarityColors[rarity ? rarity.toLowerCase() : ''] || "bg-gray-700 text-gray-300";

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
    >
      <span className="mr-1">✦</span>
      {rarity}
    </div>
  );
};
