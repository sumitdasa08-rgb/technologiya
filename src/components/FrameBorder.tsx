const FrameBorder = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-4 md:h-5 bg-transparent border-b border-border/40" />
      
      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-4 md:h-5 bg-transparent border-t border-border/40" />
      
      {/* Left border */}
      <div className="absolute top-0 bottom-0 left-0 w-4 md:w-5 bg-transparent border-r border-border/40" />
      
      {/* Right border */}
      <div className="absolute top-0 bottom-0 right-0 w-4 md:w-5 bg-transparent border-l border-border/40" />
      
      {/* Corner accents */}
      <div className="absolute top-4 md:top-5 left-4 md:left-5 w-3 h-3 border-l border-t border-border/60" />
      <div className="absolute top-4 md:top-5 right-4 md:right-5 w-3 h-3 border-r border-t border-border/60" />
      <div className="absolute bottom-4 md:bottom-5 left-4 md:left-5 w-3 h-3 border-l border-b border-border/60" />
      <div className="absolute bottom-4 md:bottom-5 right-4 md:right-5 w-3 h-3 border-r border-b border-border/60" />
    </div>
  );
};

export default FrameBorder;
