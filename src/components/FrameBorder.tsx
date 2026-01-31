const FrameBorder = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Outer border */}
      <div className="absolute inset-[10px] md:inset-[14px] lg:inset-[18px] border border-white/40" />
      {/* Inner border - creates double effect */}
      <div className="absolute inset-[14px] md:inset-[18px] lg:inset-[22px] border border-white/50" />
    </div>
  );
};

export default FrameBorder;
