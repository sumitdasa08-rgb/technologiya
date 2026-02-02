const FrameBorder = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Subtle gray border frame */}
      <div 
        className="absolute inset-[12px] md:inset-[16px] lg:inset-[20px] rounded-lg"
        style={{
          border: '1px solid rgba(103, 103, 103, 0.4)',
        }}
      />
    </div>
  );
};

export default FrameBorder;
