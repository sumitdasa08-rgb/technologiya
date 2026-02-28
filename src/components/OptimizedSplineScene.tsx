import { Suspense, useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';
import { useDevicePerformance, getQualitySettings } from '@/hooks/use-device-performance';
import { SplineErrorBoundary } from './SplineErrorBoundary';

interface OptimizedSplineSceneProps {
  scene: string;
  className?: string;
  fallbackImage?: string;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Optimized Spline component with:
 * - Device capability detection
 * - Progressive loading (lazy on low-end)
 * - Fallback image for low-end / failed loads
 * - Error boundary
 * - Performance monitoring
 * - Network awareness
 */
export function OptimizedSplineScene({
  scene,
  className,
  fallbackImage,
  onLoadStart,
  onLoadComplete,
  onError,
}: OptimizedSplineSceneProps) {
  const performance = useDevicePerformance();
  const quality = getQualitySettings(performance);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender3D, setShouldRender3D] = useState(!quality.useStaticImage);
  const [sceneLoaded, setSceneLoaded] = useState(false);

  useEffect(() => {
    // For low-end devices, wait a moment before attempting to load Spline
    // This allows critical page content to render first
    if (quality.lazyLoadSpline) {
      const timer = setTimeout(() => {
        setShouldRender3D(true);
        onLoadStart?.();
      }, 2000); // Wait 2 seconds before loading 3D

      return () => clearTimeout(timer);
    }

    onLoadStart?.();
  }, [quality.lazyLoadSpline, onLoadStart]);

  const handleSplineLoad = () => {
    console.log('[OptimizedSpline] Scene loaded successfully');
    setIsLoading(false);
    setSceneLoaded(true);
    onLoadComplete?.();
  };

  const handleSplineError = (error: Error) => {
    console.error('[OptimizedSpline] Failed to load Spline scene:', error);
    setIsLoading(false);
    setShouldRender3D(false);
    onError?.(error);
  };

  // Render static fallback for low-end devices OR on failed load
  if (!shouldRender3D || quality.useStaticImage) {
    return (
      <div
        className={`w-full h-full bg-muted flex items-center justify-center overflow-hidden ${className || ''}`}
        aria-label="3D model fallback"
      >
        {fallbackImage ? (
          <img
            src={fallbackImage}
            alt="3D Robot Model"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted-foreground/10 mx-auto mb-4 animate-pulse" />
            <p className="text-xs text-muted-foreground">
              {quality.lazyLoadSpline ? '3D Model Loading...' : '3D Not Supported'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Device: {performance.tier} | Network: {performance.networkType} | GPU: {performance.gpu}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render 3D Spline scene with error boundary
  return (
    <SplineErrorBoundary
      fallback={
        <div className="w-full h-full bg-muted flex items-center justify-center">
          {fallbackImage && (
            <img
              src={fallbackImage}
              alt="3D Robot Model"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      }
      onError={(error) => {
        console.error('[OptimizedSpline] Error boundary triggered:', error);
        setIsLoading(false);
        setShouldRender3D(false);
        onError?.(error);
      }}
    >
      <div className="w-full h-full">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-background/50">
              {/* Minimal loading spinner */}
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
              </div>
            </div>
          }
        >
          <SplineWithQuality
            scene={scene}
            className={className}
            quality={quality.splineQuality as any}
            onLoad={handleSplineLoad}
            onError={handleSplineError}
          />
        </Suspense>
      </div>
    </SplineErrorBoundary>
  );
}

/**
 * Internal component that renders Spline with quality parameter
 * Note: Spline viewer may not support quality param, but we pass it for future compatibility
 */
function SplineWithQuality({
  scene,
  className,
  quality,
  onLoad,
  onError,
}: {
  scene: string;
  className?: string;
  quality: 'low' | 'medium' | 'high';
  onLoad: () => void;
  onError: (error: Error) => void;
}) {
  return (
    <div
      className={`w-full h-full ${className || ''}`}
      onLoad={(e: any) => {
        console.log('[SplineWithQuality] Loaded');
        onLoad();
      }}
    >
      <Spline
        scene={scene}
        onLoad={onLoad}
        onError={onError}
        // Quality parameter (if Spline supports it in future versions)
        {...(quality && { quality })}
      />
    </div>
  );
}

export default OptimizedSplineScene;
