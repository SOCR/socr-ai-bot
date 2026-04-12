'use client'

import { useEffect, useRef, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Palette, BarChart3, ZoomIn, ZoomOut, Maximize2, Loader2, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColorMappedImageProps {
  src: string
  alt: string
  className?: string
  showControls?: boolean
  compact?: boolean // For grid view
  controlsOnly?: boolean // Only render controls, no image
  // Controlled props for shared settings
  colormap?: string
  brightness?: number
  contrast?: number
  zoom?: number
  rotation?: number // 0, 90, 180, 270 degrees
  flipH?: boolean // Horizontal flip
  flipV?: boolean // Vertical flip
  onColormapChange?: (colormap: string) => void
  onBrightnessChange?: (brightness: number) => void
  onContrastChange?: (contrast: number) => void
  onZoomChange?: (zoom: number) => void
  onRotationChange?: (rotation: number) => void
  onFlipHChange?: (flipH: boolean) => void
  onFlipVChange?: (flipV: boolean) => void
}

// Define colormap types
type ColorMap = 'gray' | 'viridis' | 'plasma' | 'inferno' | 'magma' | 'hot' | 'cool' | 'jet' | 'bone'

// Colormap lookup tables (0-255 mapped to RGB)
const COLORMAPS: Record<ColorMap, (value: number) => [number, number, number]> = {
  gray: (v) => [v, v, v],
  
  viridis: (v) => {
    const t = v / 255
    const r = Math.floor(255 * (0.267 + t * (0.329 - 0.267)))
    const g = Math.floor(255 * (0.005 + t * (0.993 - 0.005)))
    const b = Math.floor(255 * (0.329 + t * (0.561 - 0.329)))
    return [r, g, b]
  },
  
  plasma: (v) => {
    const t = v / 255
    const r = Math.floor(255 * (0.050 + t * (0.940 - 0.050)))
    const g = Math.floor(255 * (0.030 + t * (0.980 - 0.030)))
    const b = Math.floor(255 * (0.528 + t * (0.015 - 0.528)))
    return [r, g, b]
  },
  
  inferno: (v) => {
    const t = v / 255
    const r = Math.floor(255 * Math.min(1, t * 1.5))
    const g = Math.floor(255 * Math.max(0, Math.min(1, (t - 0.2) * 2)))
    const b = Math.floor(255 * Math.max(0, (t - 0.5) * 2))
    return [r, g, b]
  },
  
  magma: (v) => {
    const t = v / 255
    const r = Math.floor(255 * Math.min(1, t * 1.3))
    const g = Math.floor(255 * Math.max(0, (t - 0.3) * 1.5))
    const b = Math.floor(255 * Math.max(0, Math.min(1, (t - 0.1) * 1.2)))
    return [r, g, b]
  },
  
  hot: (v) => {
    const t = v / 255
    const r = Math.floor(255 * Math.min(1, t * 3))
    const g = Math.floor(255 * Math.max(0, Math.min(1, (t - 0.33) * 3)))
    const b = Math.floor(255 * Math.max(0, (t - 0.66) * 3))
    return [r, g, b]
  },
  
  cool: (v) => {
    const t = v / 255
    const r = Math.floor(255 * t)
    const g = Math.floor(255 * (1 - t))
    const b = 255
    return [r, g, b]
  },
  
  jet: (v) => {
    const t = v / 255
    const r = Math.floor(255 * Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 3))))
    const g = Math.floor(255 * Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 2))))
    const b = Math.floor(255 * Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 1))))
    return [r, g, b]
  },
  
  bone: (v) => {
    const t = v / 255
    const r = Math.floor(255 * (0.75 * t + 0.25 * t * t))
    const g = Math.floor(255 * (0.75 * t + 0.25 * t * t * t))
    const b = Math.floor(255 * (0.75 * t + 0.25 * t))
    return [r, g, b]
  }
}

export default function ColorMappedImage({ 
  src, 
  alt, 
  className = '',
  showControls = true,
  compact = false,
  controlsOnly = false,
  colormap: controlledColormap,
  brightness: controlledBrightness,
  contrast: controlledContrast,
  zoom: controlledZoom,
  rotation: controlledRotation,
  flipH: controlledFlipH,
  flipV: controlledFlipV,
  onColormapChange,
  onBrightnessChange,
  onContrastChange,
  onZoomChange,
  onRotationChange,
  onFlipHChange,
  onFlipVChange
}: ColorMappedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const colorbarCanvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  
  // Use controlled or uncontrolled state
  const [internalColorMap, setInternalColorMap] = useState<ColorMap>('magma')
  const [internalBrightness, setInternalBrightness] = useState(1.0)
  const [internalContrast, setInternalContrast] = useState(1.0)
  const [internalZoom, setInternalZoom] = useState(1.0)
  const [internalRotation, setInternalRotation] = useState(0)
  const [internalFlipH, setInternalFlipH] = useState(false)
  const [internalFlipV, setInternalFlipV] = useState(false)
  
  const colorMap = (controlledColormap || internalColorMap) as ColorMap
  const brightness = controlledBrightness ?? internalBrightness
  const contrast = controlledContrast ?? internalContrast
  const zoom = controlledZoom ?? internalZoom
  const rotation = controlledRotation ?? internalRotation
  const flipH = controlledFlipH ?? internalFlipH
  const flipV = controlledFlipV ?? internalFlipV
  
  // Debug logging for grid view
  useEffect(() => {
    if (compact) {
      console.log(`[ColorMappedImage ${src.split('/').pop()}] Compact mode props:`, {
        controlledRotation,
        rotation,
        controlledFlipH,
        flipH,
        controlledFlipV,
        flipV
      })
    }
  }, [compact, src, controlledRotation, rotation, controlledFlipH, flipH, controlledFlipV, flipV])
  
  const setColorMap = (value: ColorMap) => {
    if (onColormapChange) {
      onColormapChange(value)
    } else {
      setInternalColorMap(value)
    }
  }
  
  const setBrightness = (value: number) => {
    if (onBrightnessChange) {
      onBrightnessChange(value)
    } else {
      setInternalBrightness(value)
    }
  }
  
  const setContrast = (value: number) => {
    if (onContrastChange) {
      onContrastChange(value)
    } else {
      setInternalContrast(value)
    }
  }
  
  const setZoom = (value: number) => {
    if (onZoomChange) {
      onZoomChange(value)
    } else {
      setInternalZoom(value)
    }
  }
  
  const setRotation = (value: number) => {
    console.log('[setRotation] called with:', value, 'onRotationChange:', !!onRotationChange, 'controlsOnly:', controlsOnly)
    if (onRotationChange) {
      onRotationChange(value)
    } else {
      setInternalRotation(value)
    }
  }
  
  const setFlipH = (value: boolean) => {
    console.log('[setFlipH] called with:', value, 'onFlipHChange:', !!onFlipHChange, 'controlsOnly:', controlsOnly)
    if (onFlipHChange) {
      onFlipHChange(value)
    } else {
      setInternalFlipH(value)
    }
  }
  
  const setFlipV = (value: boolean) => {
    console.log('[setFlipV] called with:', value, 'onFlipVChange:', !!onFlipVChange, 'controlsOnly:', controlsOnly)
    if (onFlipVChange) {
      onFlipVChange(value)
    } else {
      setInternalFlipV(value)
    }
  }
  
  const [isLoading, setIsLoading] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [showColorbar, setShowColorbar] = useState(true)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Load and process image
  useEffect(() => {
    if (controlsOnly || !src) {
      setIsLoading(false)
      return
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous' // For CORS if needed
    
    img.onload = () => {
      imageRef.current = img
      setDimensions({ width: img.width, height: img.height })
      setIsLoading(false)
      applyColorMap()
    }
    
    img.onerror = () => {
      console.error('Failed to load image:', src)
      setIsLoading(false)
    }
    
    img.src = src
  }, [src, controlsOnly])

  // Apply colormap whenever settings change
  useEffect(() => {
    if (imageRef.current && !isLoading) {
      applyColorMap()
      if (showColorbar) {
        drawColorbar()
      }
    }
  }, [colorMap, brightness, contrast, rotation, flipH, flipV, isLoading, showColorbar])
  
  // Reset pan when zoom changes to 1.0
  useEffect(() => {
    if (zoom === 1.0) {
      setPanOffset({ x: 0, y: 0 })
    }
  }, [zoom])

  const applyColorMap = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    
    if (!canvas || !img) return
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Debug logging
    if (compact) {
      console.log(`[applyColorMap ${src.split('/').pop()}]`, { rotation, flipH, flipV })
    }

    // Adjust canvas size based on rotation
    // For 90 or 270 degree rotation, swap width and height
    const is90or270 = rotation === 90 || rotation === 270
    canvas.width = is90or270 ? img.height : img.width
    canvas.height = is90or270 ? img.width : img.height

    // Save context state
    ctx.save()

    // Apply transformations
    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2)
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)
    
    // Apply flips
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)

    // Draw original image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2)

    // Restore context state
    ctx.restore()

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Apply colormap
    const colormapFunc = COLORMAPS[colorMap]
    
    for (let i = 0; i < data.length; i += 4) {
      // Get grayscale value (average of RGB or use R channel if already grayscale)
      const gray = data[i] // Assuming grayscale, otherwise: (data[i] + data[i+1] + data[i+2]) / 3
      
      // Apply brightness and contrast
      let adjusted = (gray - 127.5) * contrast + 127.5 + (brightness - 1) * 255
      adjusted = Math.max(0, Math.min(255, adjusted))
      
      // Apply colormap
      const [r, g, b] = colormapFunc(adjusted)
      
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      // Keep alpha unchanged: data[i + 3]
    }

    // Put modified data back
    ctx.putImageData(imageData, 0, 0)
  }

  const drawColorbar = () => {
    const canvas = colorbarCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 40
    const height = 256
    canvas.width = width
    canvas.height = height

    const colormapFunc = COLORMAPS[colorMap]

    // Draw colorbar from top (high values) to bottom (low values)
    for (let y = 0; y < height; y++) {
      const value = 255 - y // Reverse so high values are at top
      const [r, g, b] = colormapFunc(value)
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(0, y, width, 1)
    }
  }

  // Controls only mode (for grid view shared controls)
  if (controlsOnly) {
    return (
      <div className="absolute left-4 top-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 space-y-4 w-48 z-20">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Shared Controls</span>
        </div>

        {/* Colormap selector */}
        <div>
          <Label htmlFor="colormap-select-grid" className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
            Colormap
          </Label>
          <Select value={colorMap} onValueChange={(v) => setColorMap(v as ColorMap)}>
            <SelectTrigger id="colormap-select-grid" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gray">Gray</SelectItem>
              <SelectItem value="viridis">Viridis</SelectItem>
              <SelectItem value="plasma">Plasma</SelectItem>
              <SelectItem value="inferno">Inferno</SelectItem>
              <SelectItem value="magma">Magma</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="cool">Cool</SelectItem>
              <SelectItem value="jet">Jet</SelectItem>
              <SelectItem value="bone">Bone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Brightness slider */}
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
            Brightness
          </Label>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={[brightness]}
            onValueChange={(v) => setBrightness(v[0])}
            className="w-full"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{brightness.toFixed(2)}</span>
        </div>

        {/* Contrast slider */}
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
            Contrast
          </Label>
          <Slider
            min={0.5}
            max={3}
            step={0.1}
            value={[contrast]}
            onValueChange={(v) => setContrast(v[0])}
            className="w-full"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{contrast.toFixed(2)}</span>
        </div>

        {/* Zoom controls */}
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
            Zoom
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut size={14} />
            </Button>
            <Slider
              min={0.5}
              max={5}
              step={0.25}
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0])}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.min(5, zoom + 0.25))}
              disabled={zoom >= 5}
            >
              <ZoomIn size={14} />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">{zoom.toFixed(2)}x</span>
            {zoom !== 1.0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setZoom(1.0)}
              >
                <Maximize2 size={12} className="mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Rotation control */}
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
            Rotation
          </Label>
          <div className="grid grid-cols-4 gap-1">
            <Button
              variant={rotation === 0 ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-1"
              onClick={() => setRotation(0)}
            >
              0°
            </Button>
            <Button
              variant={rotation === 90 ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-1"
              onClick={() => setRotation(90)}
            >
              90°
            </Button>
            <Button
              variant={rotation === 180 ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-1"
              onClick={() => setRotation(180)}
            >
              180°
            </Button>
            <Button
              variant={rotation === 270 ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-1"
              onClick={() => setRotation(270)}
            >
              270°
            </Button>
          </div>
        </div>

        {/* Flip controls */}
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
            Flip
          </Label>
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant={flipH ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-1"
              onClick={() => setFlipH(!flipH)}
            >
              <FlipHorizontal size={12} />
            </Button>
            <Button
              variant={flipV ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-1"
              onClick={() => setFlipV(!flipV)}
            >
              <FlipVertical size={12} />
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  // Compact view for grid
  if (compact) {
    return (
      <div className={cn("relative w-full h-full", className)}>
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500 dark:text-indigo-400" />
          </div>
        )}
      </div>
    )
  }

  // Mouse handlers for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1.0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoom > 1.0) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className={cn("relative w-full h-full flex", className)}>
      {/* Floating left toolbar */}
      {showControls && !isLoading && (
        <div className="absolute left-4 top-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 space-y-4 w-48">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Controls</span>
          </div>

          {/* Colormap selector */}
          <div>
            <Label htmlFor="colormap-select" className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
              Colormap
            </Label>
            <Select value={colorMap} onValueChange={(v) => setColorMap(v as ColorMap)}>
              <SelectTrigger id="colormap-select" className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gray">Gray</SelectItem>
                <SelectItem value="viridis">Viridis</SelectItem>
                <SelectItem value="plasma">Plasma</SelectItem>
                <SelectItem value="inferno">Inferno</SelectItem>
                <SelectItem value="magma">Magma</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="cool">Cool</SelectItem>
                <SelectItem value="jet">Jet</SelectItem>
                <SelectItem value="bone">Bone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brightness slider */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
              Brightness
            </Label>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[brightness]}
              onValueChange={(v) => setBrightness(v[0])}
              className="w-full"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{brightness.toFixed(2)}</span>
          </div>

          {/* Contrast slider */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
              Contrast
            </Label>
            <Slider
              min={0.5}
              max={3}
              step={0.1}
              value={[contrast]}
              onValueChange={(v) => setContrast(v[0])}
              className="w-full"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{contrast.toFixed(2)}</span>
          </div>

          {/* Zoom controls */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
              Zoom
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                disabled={zoom <= 0.5}
              >
                <ZoomOut size={14} />
              </Button>
              <Slider
                min={0.5}
                max={5}
                step={0.25}
                value={[zoom]}
                onValueChange={(v) => setZoom(v[0])}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoom(Math.min(5, zoom + 0.25))}
                disabled={zoom >= 5}
              >
                <ZoomIn size={14} />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{zoom.toFixed(2)}x</span>
              {zoom !== 1.0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setZoom(1.0)}
                >
                  <Maximize2 size={12} className="mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Rotation control */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
              Rotation
            </Label>
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant={rotation === 0 ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-1"
                onClick={() => setRotation(0)}
              >
                0°
              </Button>
              <Button
                variant={rotation === 90 ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-1"
                onClick={() => setRotation(90)}
              >
                90°
              </Button>
              <Button
                variant={rotation === 180 ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-1"
                onClick={() => setRotation(180)}
              >
                180°
              </Button>
              <Button
                variant={rotation === 270 ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-1"
                onClick={() => setRotation(270)}
              >
                270°
              </Button>
            </div>
          </div>

          {/* Flip controls */}
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 block">
              Flip
            </Label>
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant={flipH ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-1"
                onClick={() => setFlipH(!flipH)}
              >
                <FlipHorizontal size={12} />
              </Button>
              <Button
                variant={flipV ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-1"
                onClick={() => setFlipV(!flipV)}
              >
                <FlipVertical size={12} />
              </Button>
            </div>
          </div>

          {/* Colorbar toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Label htmlFor="colorbar-toggle" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
              Show Colorbar
            </Label>
            <Switch
              id="colorbar-toggle"
              checked={showColorbar}
              onCheckedChange={setShowColorbar}
            />
          </div>
        </div>
      )}

      {/* Main image area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading image...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              width: dimensions.width > 0 ? 'auto' : '100%',
              height: dimensions.height > 0 ? 'auto' : '100%',
              maxWidth: zoom > 1 ? 'none' : '100%',
              maxHeight: zoom > 1 ? 'none' : '100%'
            }}
          />
        )}
        {zoom > 1.0 && !isDragging && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 dark:bg-gray-800/70 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
            Click and drag to pan
          </div>
        )}
      </div>

      {/* Colorbar on the right */}
      {showControls && !isLoading && showColorbar && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <div className="flex flex-col items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Scale</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Color intensity scale</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end text-xs text-gray-600 dark:text-gray-400 gap-1">
                <span>High</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">255</span>
              </div>
              <canvas
                ref={colorbarCanvasRef}
                className="border border-gray-300 dark:border-gray-600 rounded"
                style={{ width: '30px', height: '200px' }}
              />
              <div className="flex flex-col items-start text-xs text-gray-600 dark:text-gray-400 gap-1">
                <span>Low</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

