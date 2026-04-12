'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GlowEffect } from '@/components/ui/glow-effect'
import {
  Eye,
  Download,
  Trash2,
  Calendar,
  Layers,
  Box
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ImageSet {
  id: string
  name: string
  createdAt: string
  dimensionType: '2D' | '3D'
  model: string
  imageCount: number
  thumbnailUrl: string | null
  images: {
    t1: string | null
    t2: string | null
    flair: string | null
    seg: string | null
    t1ce: string | null
  }
}

interface ImageSetCardProps {
  imageSet: ImageSet
  onView: (imageSet: ImageSet) => void
  onDownload: (imageSet: ImageSet) => void
  onDelete: (imageSet: ImageSet) => void
  isDeleting?: boolean
}

export default function ImageSetCard({
  imageSet,
  onView,
  onDownload,
  onDelete,
  isDeleting = false
}: ImageSetCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect Container - OUTSIDE the card */}
      <div className={cn(
        "absolute -inset-1 rounded-xl transition-opacity duration-500",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <GlowEffect
          mode="rotate"
          blur="medium"
          colors={[
            'var(--color-1)',
            'var(--color-5)',
            'var(--color-3)',
            'var(--color-4)',
            'var(--color-2)',
          ]}
        />
      </div>

      {/* Card Content */}
      <Card className={cn(
        "relative bg-white dark:bg-gray-900 rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer",
        "group-hover:scale-[1.02] group-hover:shadow-md",
        isHovered ? "border-gray-300 dark:border-gray-700 shadow-sm" : "border-gray-200 dark:border-gray-800 shadow-sm",
        isDeleting && "opacity-50 pointer-events-none"
      )}
        onClick={() => onView(imageSet)}
      >
        {/* Thumbnail/Preview */}
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
          {imageSet.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSet.thumbnailUrl}
              alt={imageSet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {imageSet.dimensionType === '3D' ? (
                <Box className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              ) : (
                <Layers className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              )}
            </div>
          )}

          {/* Dimension Badge */}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-medium bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-md border border-gray-200 dark:border-gray-700">
              {imageSet.dimensionType}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate" title={imageSet.name}>
            {imageSet.name}
          </h3>

          <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(imageSet.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" />
              <span className="truncate" title={imageSet.model}>{imageSet.model}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{imageSet.imageCount} image{imageSet.imageCount > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onView(imageSet)
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDownload(imageSet)
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(imageSet)
              }}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
