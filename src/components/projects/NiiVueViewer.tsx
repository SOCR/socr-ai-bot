'use client'

import { useEffect, useRef, useState } from 'react'
import { Niivue } from '@niivue/niivue'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { 
  Box, 
  Layers, 
  SplitSquareVertical, 
  Grid3X3,
  Palette,
  Contrast,
  Maximize,
  Grid,
  Ruler,
  Settings,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NiiVueViewerProps {
  niftiUrl: string | null
  onError?: (error: Error) => void
}

// View types supported by NiiVue
type ViewType = 'multiplanar' | 'axial' | 'coronal' | 'sagittal' | 'render'

// Available color maps in NiiVue
const COLOR_MAPS = [
  'gray', 'red', 'green', 'blue', 'winter', 'summer', 
  'autumn', 'spring', 'cool', 'hot', 'bone', 'copper', 
  'pink', 'hsv', 'jet', 'parula', 'viridis', 'inferno', 
  'magma', 'plasma', 'niivue'
]

export default function NiiVueViewer({ niftiUrl, onError }: NiiVueViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const niivueRef = useRef<Niivue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<ViewType>('render')
  const [bgOpacity, setBgOpacity] = useState(1.0)
  const [colorMap, setColorMap] = useState('magma')
  const [isClipPlaneEnabled, setIsClipPlaneEnabled] = useState(false)
  const [isRadiological, setIsRadiological] = useState(false)
  const [isOrientationCube, setIsOrientationCube] = useState(true)
  const [isColorbar, setIsColorbar] = useState(true)
  const [showCrosshair, setShowCrosshair] = useState(true)
  const [contrastMin, setContrastMin] = useState(0)
  const [contrastMax, setContrastMax] = useState(1)
  const [volumeRanges, setVolumeRanges] = useState<[number, number]>([0, 1])
  const [crosshairLocation, setCrosshairLocation] = useState("")

  // Initialize NiiVue
  useEffect(() => {
    if (!canvasRef.current) return

    // Only initialize once
    if (!niivueRef.current) {
      const nv = new Niivue({
        backColor: [0.5, 0.5, 0.5, 1],
        show3Dcrosshair: true,
        isColorbar: true,
        isOrientCube: true,
        meshThicknessOn2D: 0.5,
        meshXRay: 0.0,
      })

      // Set up custom location change handler
      nv.onLocationChange = (data: any) => {
        if (data && typeof data.string === 'string') {
          setCrosshairLocation(data.string);
        }
      };

      nv.attachToCanvas(canvasRef.current)
      niivueRef.current = nv
    }

    // Set listener for window resize
    const handleResize = () => {
      if (niivueRef.current && canvasRef.current) {
        niivueRef.current.drawScene()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Load NIFTI volume when URL changes
  useEffect(() => {
    const loadVolume = async () => {
      if (!niivueRef.current || !niftiUrl) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('Loading NIFTI from URL:', niftiUrl);
        
        // Clear previous volumes
        if (niivueRef.current.volumes.length > 0) {
          await niivueRef.current.removeVolume(niivueRef.current.volumes[0])
        }

        // Load new volume
        await niivueRef.current.loadVolumes([{
          url: niftiUrl,
          colormap: colorMap,
          opacity: bgOpacity
        }])

        // Set 3D render view by default
        niivueRef.current.setSliceType(niivueRef.current.sliceTypeRender)
        // Set 3D rendering angle
        if (niivueRef.current.volumes[0]) {
          niivueRef.current.volumes[0].opacity = bgOpacity
          niivueRef.current.setRenderAzimuthElevation(110, 15)
          niivueRef.current.updateGLVolume()
        }

        // Get volume range for contrast slider
        if (niivueRef.current.volumes.length > 0) {
          const volume = niivueRef.current.volumes[0];
          const cal_min = volume.cal_min || 0;
          const cal_max = volume.cal_max || 1;
          setVolumeRanges([cal_min, cal_max]);
          setContrastMin(cal_min);
          setContrastMax(cal_max);
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading NIFTI volume:', err)
        setError('Failed to load 3D volume')
        setIsLoading(false)
        if (onError && err instanceof Error) {
          onError(err)
        }
      }
    }

    loadVolume()
  }, [niftiUrl, onError])

  // Update view type
  useEffect(() => {
    if (!niivueRef.current || niivueRef.current.volumes.length === 0) return

    switch (viewType) {
      case 'multiplanar':
        niivueRef.current.setSliceType(niivueRef.current.sliceTypeMultiplanar)
        break
      case 'axial':
        niivueRef.current.setSliceType(niivueRef.current.sliceTypeAxial)
        break
      case 'coronal':
        niivueRef.current.setSliceType(niivueRef.current.sliceTypeCoronal)
        break
      case 'sagittal':
        niivueRef.current.setSliceType(niivueRef.current.sliceTypeSagittal)
        break
      case 'render':
        niivueRef.current.setSliceType(niivueRef.current.sliceTypeRender)
        // Force volume rendering mode
        if (niivueRef.current.volumes[0]) {
          niivueRef.current.volumes[0].opacity = bgOpacity
          niivueRef.current.setRenderAzimuthElevation(110, 15)
          niivueRef.current.updateGLVolume()
        }
        break
    }
  }, [viewType, bgOpacity])

  // Update settings effects for various properties
  useEffect(() => {
    if (!niivueRef.current || niivueRef.current.volumes.length === 0) return
    niivueRef.current.volumes[0].opacity = bgOpacity
    niivueRef.current.updateGLVolume()
  }, [bgOpacity])

  useEffect(() => {
    if (!niivueRef.current || niivueRef.current.volumes.length === 0) return
    niivueRef.current.volumes[0].colormap = colorMap;
    niivueRef.current.updateGLVolume();
  }, [colorMap])

  useEffect(() => {
    if (!niivueRef.current || niivueRef.current.volumes.length === 0) return
    if (isClipPlaneEnabled) {
      niivueRef.current.setClipPlane([0, 0, 90])
    } else {
      niivueRef.current.setClipPlane([2, 0, 90])
    }
    niivueRef.current.updateGLVolume()
  }, [isClipPlaneEnabled])

  useEffect(() => {
    if (!niivueRef.current) return
    niivueRef.current.setRadiologicalConvention(isRadiological);
  }, [isRadiological])

  useEffect(() => {
    if (!niivueRef.current) return
    niivueRef.current.opts.isOrientCube = isOrientationCube;
    niivueRef.current.drawScene();
  }, [isOrientationCube])

  useEffect(() => {
    if (!niivueRef.current) return
    niivueRef.current.opts.isColorbar = isColorbar;
    niivueRef.current.drawScene();
  }, [isColorbar])

  useEffect(() => {
    if (!niivueRef.current) return
    niivueRef.current.opts.show3Dcrosshair = showCrosshair;
    niivueRef.current.drawScene();
  }, [showCrosshair])

  useEffect(() => {
    if (!niivueRef.current || niivueRef.current.volumes.length === 0) return
    const volume = niivueRef.current.volumes[0];
    volume.cal_min = contrastMin;
    volume.cal_max = contrastMax;
    niivueRef.current.updateGLVolume();
  }, [contrastMin, contrastMax])


  // Render error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Error Loading 3D Volume</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // Icon button component for toolbar
  const IconButton = ({ 
    icon: Icon, 
    label, 
    active = false, 
    onClick,
    ...props 
  }: { 
    icon: any; 
    label: string; 
    active?: boolean; 
    onClick?: () => void; 
    [key: string]: any;
  }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
      <button
        className={cn(
          "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
          active && "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
        )}
        onClick={onClick}
        {...props}
      >
        <Icon size={18} />
      </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Compact toolbar */}
      <div className="flex items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-1 px-2 gap-1">
        {/* Views label and buttons */}
        <div className="flex items-center mr-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2 px-2">Views</span>
          <div className="flex items-center">
            <IconButton 
              icon={Grid3X3} 
              label="Multiplanar View"
              active={viewType === 'multiplanar'}
              onClick={() => setViewType('multiplanar')}
            />
            <IconButton 
              icon={SplitSquareVertical} 
              label="Axial View"
              active={viewType === 'axial'}
              onClick={() => setViewType('axial')}
            />
            <IconButton 
              icon={() => <SplitSquareVertical className="rotate-90" />} 
              label="Coronal View"
              active={viewType === 'coronal'}
              onClick={() => setViewType('coronal')}
            />
            <IconButton 
              icon={() => <SplitSquareVertical className="-rotate-90" />} 
              label="Sagittal View"
              active={viewType === 'sagittal'}
              onClick={() => setViewType('sagittal')}
            />
            <IconButton 
              icon={Box} 
              label="3D Render"
              active={viewType === 'render'}
              onClick={() => setViewType('render')}
            />
          </div>
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Opacity control */}
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-1 px-2">Opacity</span>
          <Layers size={16} className="text-gray-500 dark:text-gray-400" />
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[bgOpacity]}
            onValueChange={(values) => setBgOpacity(values[0])}
            className="w-24 h-4"
          />
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Clip plane toggle */}
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-1 px-2">Clip Plane</span>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
                    isClipPlaneEnabled && "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                  )}
                  onClick={() => setIsClipPlaneEnabled(!isClipPlaneEnabled)}
                >
                  <Maximize size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Clip Plane</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Color & contrast popover */}
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-1 px-2">Colors</span>
          <Popover>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Palette size={18} />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Color Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          <PopoverContent className="w-80 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <h4 className="font-medium">Color Settings</h4>
              
              <div>
                <Label htmlFor="color-map-select" className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">
                  Color Map
                </Label>
                <Select value={colorMap} onValueChange={setColorMap}>
                  <SelectTrigger id="color-map-select" className="bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Select color map" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_MAPS.map(map => (
                      <SelectItem key={map} value={map}>
                        {map.charAt(0).toUpperCase() + map.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="colorbar-toggle" className="text-gray-600 dark:text-gray-400 text-sm">
                  Show Colorbar
                </Label>
                <Switch
                  id="colorbar-toggle"
                  checked={isColorbar}
                  onCheckedChange={setIsColorbar}
                />
              </div>
              
              <div>
                <Label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">
                  Contrast Range
                </Label>
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Min</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{contrastMin.toFixed(1)}</span>
                  </div>
                  <Slider
                    min={volumeRanges[0]}
                    max={volumeRanges[1]}
                    step={(volumeRanges[1] - volumeRanges[0]) / 100}
                    value={[contrastMin, contrastMax]}
                    onValueChange={([min, max]) => {
                      setContrastMin(min);
                      setContrastMax(max);
                    }}
                    className="flex-1 h-6"
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Max</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{contrastMax.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                  Drag both handles to adjust range
                </p>
              </div>
            </div>
          </PopoverContent>
          </Popover>
        </div>
        
        {/* Display options popover */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-1 px-2">Display</span>
          <Popover>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Settings size={18} />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Display Options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          <PopoverContent className="w-72 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <h4 className="font-medium">Display Options</h4>
              
                  <div className="flex items-center justify-between">
                    <Label htmlFor="radiological-toggle" className="text-gray-600 dark:text-gray-400 text-sm">
                      Radiological Convention
                    </Label>
                <Switch
                  id="radiological-toggle"
                  checked={isRadiological}
                  onCheckedChange={setIsRadiological}
                />
              </div>
              
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orientation-cube-toggle" className="text-gray-600 dark:text-gray-400 text-sm">
                      Orientation Cube
                    </Label>
                <Switch
                  id="orientation-cube-toggle"
                  checked={isOrientationCube}
                  onCheckedChange={setIsOrientationCube}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="crosshair-toggle" className="text-gray-600 dark:text-gray-400 text-sm">
                  Show Crosshair
                </Label>
                <Switch
                  id="crosshair-toggle"
                  checked={showCrosshair}
                  onCheckedChange={setShowCrosshair}
                />
              </div>
            </div>
          </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Canvas container */}
      <div className={cn("relative flex-grow w-full", isLoading ? "opacity-50" : "opacity-100")}>
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
        ></canvas>
        
        {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/20 dark:bg-gray-950/40">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-center text-sm font-medium">Loading volume...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with crosshair location information */}
      {crosshairLocation && (
        <div className="bg-gray-50 border-t p-1 text-xs text-gray-700 font-mono truncate">
          {crosshairLocation}
        </div>
      )}
    </div>
  )
} 