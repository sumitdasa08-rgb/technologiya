import { useCallback, useEffect } from 'react';
import { logger } from '@/utils/logger';

/**
 * Hook to use logger in React components
 * Automatically logs component mount/unmount and errors
 */
export function useLogger(componentName: string) {
  useEffect(() => {
    logger.logDebug(componentName, 'Component mounted');

    return () => {
      logger.logDebug(componentName, 'Component unmounted');
    };
  }, [componentName]);

  const logDebug = useCallback(
    (message: string, data?: Record<string, any>) => {
      logger.logDebug(componentName, message, data);
    },
    [componentName]
  );

  const logInfo = useCallback(
    (message: string, data?: Record<string, any>) => {
      logger.logInfo(componentName, message, data);
    },
    [componentName]
  );

  const logWarn = useCallback(
    (message: string, data?: Record<string, any>) => {
      logger.logWarn(componentName, message, data);
    },
    [componentName]
  );

  const logError = useCallback(
    (message: string, data?: Record<string, any>, error?: Error) => {
      logger.logError(componentName, message, data, error);
    },
    [componentName]
  );

  const logPerformance = useCallback(
    (metric: string, duration: number, data?: Record<string, any>) => {
      logger.logPerformance(metric, duration, data);
    },
    [componentName]
  );

  return { logDebug, logInfo, logWarn, logError, logPerformance };
}

export default useLogger;
