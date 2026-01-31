const FrameBorder = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Double border frame like engine.fm - outer border */}
      <div className="absolute inset-2 md:inset-3 lg:inset-4 border border-white/30 rounded-sm" />
      {/* Inner border for double effect */}
      <div className="absolute inset-3 md:inset-4 lg:inset-5 border border-white/20 rounded-sm" />
    </div>
  );
};

export default FrameBorder;
