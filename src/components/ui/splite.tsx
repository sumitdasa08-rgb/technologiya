'use client'

import { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

/**
 * Load robot scene immediately on mount and keep it mounted.
 * No lazy IntersectionObserver gating — starts loading during the
 * loader screen so the robot is fully visible when the loader fades out.
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className="w-full h-full">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        }
      >
        <Spline scene={scene} className={className} />
      </Suspense>
    </div>
  )
}
