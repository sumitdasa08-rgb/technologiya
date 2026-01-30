const FrameBorder = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Single continuous border frame */}
      <div className="absolute inset-3 md:inset-4 lg:inset-5 border border-foreground/20 rounded-sm" />
    </div>
  );
};

export default FrameBorder;
