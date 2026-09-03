export const LoadingState = ({ message = "" }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[400px] bg-[#0F172A] text-white">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-white/10 border-t-[#FFD447] rounded-full animate-spin" />
      </div>
      {message && <p className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">{message}</p>}
    </div>
  );
};
