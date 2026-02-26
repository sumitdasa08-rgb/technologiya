'use client'

import { Suspense, lazy, useRef, useState, useEffect } from 'react'
import type { Application } from '@splinetool/runtime'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

/**
 * Load once per page visit, then keep mounted.
 * To prevent whole-page scroll jitter, pause WebGL rendering when offscreen
 * and resume when the hero comes back into view.
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const isVisibleRef = useRef(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || hasLoaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasLoaded(true)
          observer.disconnect() // load once, never re-fetch scene while scrolling
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasLoaded])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !hasLoaded) return

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting) {
          appRef.current?.play()
        } else {
          appRef.current?.stop()
        }
      },
      { threshold: 0.05, rootMargin: '100px' }
    )

    visibilityObserver.observe(el)
    return () => visibilityObserver.disconnect()
  }, [hasLoaded])

  return (
    <div ref={containerRef} className="w-full h-full">
      {hasLoaded ? (
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <span className="loader"></span>
            </div>
          }
        >
          <Spline
            scene={scene}
            className={className}
            onLoad={(app) => {
              appRef.current = app
              if (!isVisibleRef.current) {
                app.stop()
              }
            }}
          />
        </Suspense>
      ) : (
        <div className="w-full h-full" />
      )}
    </div>
  )
}
