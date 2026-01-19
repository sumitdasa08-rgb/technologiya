const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Animated logo */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-foreground flex items-center justify-center animate-pulse">
            <span className="text-2xl font-bold text-background">L</span>
          </div>
          {/* Loading spinner ring */}
          <div className="absolute inset-0 w-16 h-16 mx-auto border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
