'use client'

import { Suspense, lazy } from 'react'
import { MessageLoading } from '@/components/ui/message-loading'
import logoImg from '@/assets/logo.png'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <img 
            src={logoImg} 
            alt="Loading" 
            className="w-16 h-16 object-contain opacity-60 animate-pulse invert"
          />
          <MessageLoading />
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  )
}
