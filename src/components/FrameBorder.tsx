const FrameBorder = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Outer border */}
      <div className="absolute inset-[8px] md:inset-[12px] lg:inset-[16px] border border-white/40" />
      {/* Inner border - creates double effect with wider gap */}
      <div className="absolute inset-[16px] md:inset-[22px] lg:inset-[28px] border border-white/50" />
    </div>
  );
};

export default FrameBorder;
