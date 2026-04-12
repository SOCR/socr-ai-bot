'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Calendar, Layers, Box, Maximize2, Minimize2 } from 'lucide-react'
import { ImageSet } from './ImageSetCard'
import ImageViewer from './ImageViewer'
import NiiVueViewer from './NiiVueViewer'
import { cn } from '@/lib/utils'

interface ImageSetDetailModalProps {
  imageSet: ImageSet | null
  open: boolean
  onClose: () => void
  onDownload: (imageSet: ImageSet) => void
}

export default function ImageSetDetailModal({
  imageSet,
  open,
  onClose,
  onDownload
}: ImageSetDetailModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!imageSet) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "p-0 flex flex-col transition-all [&>button]:hidden",
        isFullscreen ? "max-w-[100vw] w-[100vw] h-[100vh]" : "max-w-5xl h-[90vh]"
      )}>
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold truncate">{imageSet.name}</DialogTitle>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(imageSet.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  {imageSet.dimensionType === '3D' ? (
                    <Box className="h-3.5 w-3.5" />
                  ) : (
                    <Layers className="h-3.5 w-3.5" />
                  )}
                  <span>{imageSet.dimensionType}</span>
                </div>
                <div className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                  {imageSet.model}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onDownload(imageSet)}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {imageSet.dimensionType === '2D' ? (
            <ImageViewer images={imageSet.images} />
          ) : (
            // 3D Volume display
            (() => {
              // Find the nifti URL from the images
              const niftiUrl = Object.values(imageSet.images).find(url =>
                url && url.includes('.nii.gz')
              )

              if (!niftiUrl) {
                return (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Box className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600 font-medium">No 3D Volume Available</p>
                      <p className="text-gray-400 text-sm mt-2">
                        This set does not contain a 3D volume file
                      </p>
                    </div>
                  </div>
                )
              }

              return <NiiVueViewer niftiUrl={niftiUrl} />
            })()
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
