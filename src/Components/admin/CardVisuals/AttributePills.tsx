export const AttributePills = ({
  attributes,
}: {
  attributes: Record<string, number>;
}) => {
  if (!attributes) return <div className="text-gray-500">No attributes</div>;

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(attributes).map(([key, value]) => (
        <div
          key={key}
          className="flex flex-col items-center bg-black-secondary rounded-lg p-2 border border-yellow-700/50"
        >
          <div className="text-yellow-400 font-bold">{value}</div>
          <div className="text-xs text-gray-400 capitalize">{key}</div>
        </div>
      ))}
    </div>
  );
};
