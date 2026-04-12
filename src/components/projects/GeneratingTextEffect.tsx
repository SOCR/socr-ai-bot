'use client'

import { TextEffect } from '@/components/motion-primitives/text-effect'
import { useEffect, useState } from 'react'

const GENERATION_MESSAGES = [
  'Generating synthetic brain images...',
  'Cooking up some brain scans...',
  'Creating your image set...',
  'Synthesizing medical data...',
  'Crafting realistic images...',
  'Working on it...',
  'Almost there...',
  'Building something amazing...',
]

export function GeneratingTextEffect() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GENERATION_MESSAGES.length)
      setKey((prev) => prev + 1)
    }, 3000) // Change message every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[40px] flex items-center justify-center">
      <TextEffect
        key={key}
        per="char"
        preset="fade"
        className="text-gray-600 dark:text-gray-400 text-lg font-medium"
      >
        {GENERATION_MESSAGES[currentIndex]}
      </TextEffect>
    </div>
  )
}

