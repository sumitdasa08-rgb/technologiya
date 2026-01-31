const FrameBorder = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Solid visible white border frame like engine.fm */}
      <div className="absolute inset-[10px] md:inset-[14px] lg:inset-[18px] border border-white/50" />
    </div>
  );
};

export default FrameBorder;
