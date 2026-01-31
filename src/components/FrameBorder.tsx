const FrameBorder = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Single solid visible white border frame - exactly like engine.fm */}
      <div className="absolute inset-[12px] md:inset-[16px] lg:inset-[20px] border border-white/60" />
    </div>
  );
};

export default FrameBorder;
