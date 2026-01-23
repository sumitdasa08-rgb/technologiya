// Web Audio API for generating notification sounds
export const useNotificationSound = () => {
  const playSuccessChime = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a pleasant success chime with multiple notes
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Smooth fade in/out
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };
      
      // Play a pleasant ascending chord (C-E-G-C)
      playNote(523.25, 0, 0.3);      // C5
      playNote(659.25, 0.1, 0.3);    // E5
      playNote(783.99, 0.2, 0.3);    // G5
      playNote(1046.50, 0.3, 0.4);   // C6 (higher, longer)
      
      // Haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    } catch (error) {
      console.log('Audio not supported:', error);
      // Fallback to just haptic
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  };

  return { playSuccessChime };
};
