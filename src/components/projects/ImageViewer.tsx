'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Grid3X3, Square } from 'lucide-react'
import ColorMappedImage from './ColorMappedImage'

// Define image types
export type ImageType = 't1' | 't2' | 'flair' | 'seg' | 't1ce'

// Readable display names for image types
export const IMAGE_TYPE_NAMES: Record<ImageType, string> = {
  't1': 'T1',
  't2': 'T2',
  'flair': 'FLAIR',
  'seg': 'Tumor Mask',
  't1ce': 'T1 CE'
}

interface ImageViewerProps {
  images: Record<ImageType, string | null>
  className?: string
  showTabs?: boolean
  defaultType?: ImageType
}

export default function ImageViewer({
  images,
  className = '',
  showTabs = true,
  defaultType = 'flair'
}: ImageViewerProps) {
  // Get available image types
  const availableTypes = (Object.keys(images) as ImageType[]).filter(
    type => images[type]
  )

  const [selectedImageType, setSelectedImageType] = useState<ImageType>(defaultType)
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single')
  // Shared settings for both single and grid view (synced)
  const [colormap, setColormap] = useState('magma')
  const [brightness, setBrightness] = useState(1.0)
  const [contrast, setContrast] = useState(1.0)
  const [zoom, setZoom] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  
  // Wrap setters with debug logging
  const handleSetRotation = (value: number) => {
    console.log('[ImageViewer handleSetRotation]', value)
    setRotation(value)
  }
  const handleSetFlipH = (value: boolean) => {
    console.log('[ImageViewer handleSetFlipH]', value)
    setFlipH(value)
  }
  const handleSetFlipV = (value: boolean) => {
    console.log('[ImageViewer handleSetFlipV]', value)
    setFlipV(value)
  }

  // Debug logging for rotation/flip changes
  useEffect(() => {
    if (viewMode === 'grid') {
      console.log('[ImageViewer] Grid mode - rotation/flip state:', { rotation, flipH, flipV })
    }
  }, [rotation, flipH, flipV, viewMode])

  // Set first available type when images change
  useEffect(() => {
    if (availableTypes.length > 0 && !images[selectedImageType]) {
      setSelectedImageType(availableTypes[0])
    }
  }, [images, availableTypes, selectedImageType])

  if (availableTypes.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-gray-400 dark:text-gray-500">No images available</div>
      </div>
    )
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className={`relative h-full w-full ${className}`}>
        {/* View mode toggle - top right */}
        {showTabs && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('single')}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-gray-200 dark:border-gray-700"
            >
              <Square size={16} className="mr-2" />
              Single View
            </Button>
          </div>
        )}

        {/* Shared controls for grid view - left side */}
        <ColorMappedImage
          src="" // Dummy - we'll render our own controls
          alt=""
          showControls={true}
          compact={false}
          colormap={colormap}
          brightness={brightness}
          contrast={contrast}
          zoom={zoom}
          rotation={rotation}
          flipH={flipH}
          flipV={flipV}
          onColormapChange={setColormap}
          onBrightnessChange={setBrightness}
          onContrastChange={setContrast}
          onZoomChange={setZoom}
          onRotationChange={handleSetRotation}
          onFlipHChange={handleSetFlipH}
          onFlipVChange={handleSetFlipV}
          controlsOnly={true}
        />
        
        {/* Grid layout with left padding for controls */}
        <div className="h-full w-full bg-gray-50 dark:bg-gray-950 p-4 pl-60">
          <div className={`
            grid gap-4 h-full w-full
            ${availableTypes.length === 1 ? 'grid-cols-1' : ''}
            ${availableTypes.length === 2 ? 'grid-cols-2' : ''}
            ${availableTypes.length >= 3 ? 'grid-cols-2 grid-rows-2' : ''}
          `}>
            {availableTypes.map(type => (
              <div key={type} className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-md shadow text-sm font-medium">
                  {IMAGE_TYPE_NAMES[type]}
                </div>
                {images[type] ? (
                  <ColorMappedImage
                    src={images[type] || ''}
                    alt={`${IMAGE_TYPE_NAMES[type]} image`}
                    showControls={false}
                    compact={true}
                    colormap={colormap}
                    brightness={brightness}
                    contrast={contrast}
                    zoom={zoom}
                    rotation={rotation}
                    flipH={flipH}
                    flipV={flipV}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400 dark:text-gray-500 text-sm">
                      No {IMAGE_TYPE_NAMES[type]} image
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Single view
  return (
    <Tabs
      value={selectedImageType}
      onValueChange={(v) => setSelectedImageType(v as ImageType)}
      className={`h-full flex flex-col ${className}`}
    >
      {availableTypes.map(type => (
        <TabsContent
          key={type}
          value={type}
          className="flex-1 m-0 relative"
        >
          {/* Full-size image container with colormap */}
          <div className="absolute inset-0">
            {images[type] ? (
              <ColorMappedImage
                src={images[type] || ''}
                alt={`${IMAGE_TYPE_NAMES[type]} image`}
                showControls={true}
                colormap={colormap}
                brightness={brightness}
                contrast={contrast}
                zoom={zoom}
                rotation={rotation}
                flipH={flipH}
                flipV={flipV}
                onColormapChange={setColormap}
                onBrightnessChange={setBrightness}
                onContrastChange={setContrast}
                onZoomChange={setZoom}
                onRotationChange={handleSetRotation}
                onFlipHChange={handleSetFlipH}
                onFlipVChange={handleSetFlipV}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 dark:text-gray-500">
                  No {IMAGE_TYPE_NAMES[type]} image available
                </div>
              </div>
            )}
          </div>

          {/* Tab switcher and view toggle - top right corner */}
          {showTabs && (
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
              {/* View mode toggle */}
              {availableTypes.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-gray-200 dark:border-gray-700"
                >
                  <Grid3X3 size={16} className="mr-2" />
                  Grid View
                </Button>
              )}
              
              {/* Tab switcher */}
              <TabsList className="p-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                {availableTypes.map(type => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    disabled={!images[type]}
                    className="px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-1)] data-[state=active]:via-[var(--color-3)] data-[state=active]:to-[var(--color-5)] data-[state=active]:text-white rounded-md min-w-[70px] transition-all"
                  >
                    {IMAGE_TYPE_NAMES[type]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
