'use client'

import { Suspense } from 'react'
import Spline from '@splinetool/react-spline'

interface SplineSceneProps {
  scene: string
  className?: string
}

/**
 * Load robot scene immediately on mount (eager, not lazy).
 * Spline loads during the loader screen so robot is fully visible
 * and ready when loader fades out.
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className="w-full h-full">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-background/50">
            {/* Minimal fallback - should not be visible with eager loading */}
          </div>
        }
      >
        <Spline scene={scene} className={className} />
      </Suspense>
    </div>
  )
}
