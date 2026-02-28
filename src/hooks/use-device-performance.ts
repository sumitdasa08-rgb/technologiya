import { useEffect, useState } from 'react';

/**
 * Device performance detection for adaptive rendering
 * Detects: CPU cores, RAM, GPU tier, network speed, battery info
 */

export interface DevicePerformance {
  tier: 'low' | 'medium' | 'high';
  cpuCores: number;
  ram: number | null;
  isLowPowerMode: boolean;
  networkType: '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  networkSpeed: number | null; // Mbps
  gpu: 'unknown' | 'low' | 'medium' | 'high';
  isReducedMotion: boolean;
  canRender3D: boolean;
}

/**
 * Get network information
 */
function getNetworkInfo(): {
  type: '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  speed: number | null;
} {
  try {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!connection) return { type: 'unknown', speed: null };

    const effectiveType = connection.effectiveType || 'unknown';
    const downlink = connection.downlink || null; // Mbps

    const typeMap: Record<string, '3g' | '4g' | '5g' | 'unknown'> = {
      '4g': '4g',
      '3g': '3g',
      '2g': '3g',
      slow: '3g',
      '5g': '5g',
    };

    return {
      type: (typeMap[effectiveType] || 'unknown') as any,
      speed: downlink,
    };
  } catch {
    return { type: 'unknown', speed: null };
  }
}

/**
 * Detect GPU tier based on device
 */
function detectGPU(): 'low' | 'medium' | 'high' {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');

    if (!gl) return 'low'; // No WebGL = low-end

    // Check supported extensions
    const extensions = gl.getSupportedExtensions() || [];
    const hasAdvancedFeatures =
      extensions.includes('WEBKIT_WEBGL_compressed_texture_s3tc') ||
      extensions.includes('WEBGL_compressed_texture_s3tc');

    // Check unmasked renderer
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let gpuName = 'unknown';
    if (debugInfo) {
      gpuName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
    }

    // Classify GPU
    const lowEndGPUs = ['Mali', 'Adreno 300', 'Adreno 400', 'PowerVR SGX', 'Intel HD'];
    const isLowEnd = lowEndGPUs.some((gpu) => gpuName.includes(gpu));

    if (isLowEnd) return 'low';
    if (hasAdvancedFeatures) return 'high';
    return 'medium';
  } catch {
    return 'unknown' as any;
  }
}

/**
 * Detect battery saver mode
 */
function isLowPowerMode(): boolean {
  try {
    const battery = (navigator as any).getBattery?.() || null;
    if (battery?.level !== undefined) {
      return battery.level < 0.2 && battery.charging === false;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if prefers-reduced-motion
 */
function checkReducedMotionPreference(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Classify device performance tier
 */
function classifyPerformanceTier(perf: Omit<DevicePerformance, 'tier'>): 'low' | 'medium' | 'high' {
  let score = 0;

  // CPU cores (max 8)
  score += Math.min(perf.cpuCores || 4, 8);

  // GPU capability
  if (perf.gpu === 'high') score += 3;
  else if (perf.gpu === 'medium') score += 1.5;
  else score += 0;

  // RAM consideration
  if (perf.ram) {
    if (perf.ram >= 8) score += 3;
    else if (perf.ram >= 4) score += 1.5;
    else if (perf.ram >= 2) score += 0.5;
  }

  // Network
  if (perf.networkType === '5g' || perf.networkType === 'wifi') score += 2;
  else if (perf.networkType === '4g') score += 1;
  else score -= 1;

  // Power mode
  if (perf.isLowPowerMode) score -= 2;

  // Reduced motion
  if (perf.isReducedMotion) score -= 1;

  // Classify: low < 6, medium < 14, high >= 14
  if (score < 6) return 'low';
  if (score < 14) return 'medium';
  return 'high';
}

/**
 * Hook to detect device performance characteristics
 */
export function useDevicePerformance(): DevicePerformance {
  const [performance, setPerformance] = useState<DevicePerformance>({
    tier: 'medium',
    cpuCores: 4,
    ram: null,
    isLowPowerMode: false,
    networkType: 'unknown',
    networkSpeed: null,
    gpu: 'unknown',
    isReducedMotion: false,
    canRender3D: true,
  });

  useEffect(() => {
    try {
      const cpuCores = navigator.hardwareConcurrency || 4;
      const { type: networkType, speed: networkSpeed } = getNetworkInfo();
      const gpu = detectGPU();
      const isLowPowerMode_ = isLowPowerMode();
      const isReducedMotion = checkReducedMotionPreference();

      // Try to get RAM (limited browser support)
      let ram: number | null = null;
      try {
        ram = (navigator.deviceMemory as any) || null;
      } catch {
        // Ignore
      }

      const perfData: Omit<DevicePerformance, 'tier'> = {
        cpuCores,
        ram,
        isLowPowerMode: isLowPowerMode_,
        networkType: networkType as any,
        networkSpeed,
        gpu,
        isReducedMotion,
        canRender3D: !!window.WebGLRenderingContext,
      };

      const tier = classifyPerformanceTier(perfData);

      setPerformance({
        ...perfData,
        tier,
      });

      // Log for debugging
      console.log('[Performance] Device detected:', {
        tier,
        cpuCores,
        ram,
        networkType,
        gpu,
        isReducedMotion,
      });
    } catch (error) {
      console.error('[Performance] Detection failed:', error);
    }
  }, []);

  return performance;
}

/**
 * Get quality settings based on device performance
 */
export function getQualitySettings(performance: DevicePerformance) {
  return {
    low: {
      splineScale: 'scale-75',
      disableAnimations: true,
      disableParallax: true,
      disableEffects: true,
      splineQuality: 'low',
      maxFPS: 30,
      useStaticImage: true,
      lazyLoadSpline: true,
      description: 'Minimal quality - optimized for low-end devices',
    },
    medium: {
      splineScale: 'scale-100',
      disableAnimations: false,
      disableParallax: true, // Parallax often causes jank on medium
      disableEffects: false,
      splineQuality: 'medium',
      maxFPS: 45,
      useStaticImage: false,
      lazyLoadSpline: false,
      description: 'Balanced - moderate quality with good performance',
    },
    high: {
      splineScale: 'scale-125 lg:scale-150',
      disableAnimations: false,
      disableParallax: false,
      disableEffects: false,
      splineQuality: 'high',
      maxFPS: 60,
      useStaticImage: false,
      lazyLoadSpline: false,
      description: 'Full quality - optimized for high-end devices',
    },
  }[performance.tier];
}
