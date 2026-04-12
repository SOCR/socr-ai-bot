'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface ParameterControlPanelProps {
  // Model selection
  dimensionType: '2D' | '3D'
  setDimensionType: (value: '2D' | '3D') => void
  selectedModel: string
  setSelectedModel: (value: string) => void
  numImages: number
  setNumImages: (value: number) => void

  // Model parameters
  tumour: string
  setTumour: (value: string) => void
  sliceOrientation: string
  setSliceOrientation: (value: string) => void
  sliceLocation: string
  setSliceLocation: (value: string) => void
  resolution: string
  setResolution: (value: string) => void

  // Generation state
  isGenerating: boolean
  onGenerate: () => void
}

export default function ParameterControlPanel({
  dimensionType,
  setDimensionType,
  selectedModel,
  setSelectedModel,
  numImages,
  setNumImages,
  tumour,
  setTumour,
  sliceOrientation,
  setSliceOrientation,
  sliceLocation,
  setSliceLocation,
  resolution,
  setResolution,
  isGenerating,
  onGenerate,
}: ParameterControlPanelProps) {
  // Available models
  const models2D = [
    { id: 'braingen_GAN_seg_TCGA_v1 (2D)', name: 'GAN Segmentation TCGA v1' },
    { id: 'braingen_cGAN_Multicontrast_BraTS_v1 (2D)', name: 'cGAN Multicontrast BraTS v1' },
    { id: 'braingen_cGAN_Multicontrast_seg_BraTS_v1 (2D)', name: 'cGAN Multicontrast seg BraTS v1' },
    { id: 'braingen_WaveletGAN_Multicontrast_BraTS_v1 (2D)', name: 'Wavelet GAN Multicontrast BraTS v1' },
  ]

  const models3D = [
    { id: 'braingen_gan3d_BraTS_64_v1 (3D)', name: 'GAN 3D BraTS 64 v1' },
  ]

  // Show parameter fields based on selected model
  const renderParameterFields = () => {
    if (!selectedModel) return null

    if (selectedModel === 'braingen_GAN_seg_TCGA_v1 (2D)') {
      return (
        <div className="space-y-3 mt-4">
          <div>
            <Label htmlFor="tumour-select">Tumour</Label>
            <Select value={tumour} onValueChange={setTumour}>
              <SelectTrigger id="tumour-select">
                <SelectValue placeholder="Select tumor option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="With Tumor">With Tumor</SelectItem>
                <SelectItem value="Without Tumor">Without Tumor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    if (selectedModel.includes('braingen_cGAN_Multicontrast') ||
        selectedModel === 'braingen_WaveletGAN_Multicontrast_BraTS_v1 (2D)') {
      // Get location options based on orientation
      const getLocationOptions = () => {
        switch (sliceOrientation) {
          case 'Axial':
            return [
              { value: 'Inferior', label: 'Inferior (bottom)' },
              { value: 'Middle', label: 'Middle' },
              { value: 'Superior', label: 'Superior (top)' }
            ];
          case 'Coronal':
            return [
              { value: 'Anterior', label: 'Anterior (front)' },
              { value: 'Middle', label: 'Middle' },
              { value: 'Posterior', label: 'Posterior (back)' }
            ];
          case 'Sagittal':
            return [
              { value: 'Left', label: 'Left' },
              { value: 'Middle', label: 'Middle' },
              { value: 'Right', label: 'Right' }
            ];
          default:
            return [
              { value: 'Middle', label: 'Middle' }
            ];
        }
      };

      const locationOptions = getLocationOptions();

      return (
        <div className="space-y-3 mt-4">
          <div>
            <Label htmlFor="tumour-select">Tumour</Label>
            <Select value={tumour} onValueChange={setTumour}>
              <SelectTrigger id="tumour-select">
                <SelectValue placeholder="Select tumor option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="With Tumor">With Tumor</SelectItem>
                <SelectItem value="Without Tumor">Without Tumor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="orientation-select">Slice Orientation</Label>
            <Select value={sliceOrientation} onValueChange={(value) => {
              setSliceOrientation(value);
              // Reset location to Middle when orientation changes
              setSliceLocation('Middle');
            }}>
              <SelectTrigger id="orientation-select">
                <SelectValue placeholder="Select slice orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Axial">Axial</SelectItem>
                <SelectItem value="Coronal">Coronal</SelectItem>
                <SelectItem value="Sagittal">Sagittal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location-select">Slice Location</Label>
            <Select value={sliceLocation} onValueChange={setSliceLocation}>
              <SelectTrigger id="location-select">
                <SelectValue placeholder="Select slice location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    if (selectedModel === 'braingen_gan3d_BraTS_64_v1 (3D)') {
      return (
        <div className="space-y-3 mt-4">
          <div>
            <Label htmlFor="resolution-select">Resolution</Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger id="resolution-select">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="32">32</SelectItem>
                <SelectItem value="64">64</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="w-96 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generation Controls</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure model parameters</p>
      </div>

      {/* Scrollable Middle Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Model Selection Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Dimension Type</Label>
              <RadioGroup value={dimensionType} onValueChange={setDimensionType} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2D" id="r1" />
                  <Label htmlFor="r1" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">2D</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3D" id="r2" />
                  <Label htmlFor="r2" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">3D</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="model-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model-select" className="bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {dimensionType === '2D'
                    ? models2D.map(model => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))
                    : models3D.map(model => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="num-images" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Number of Images</Label>
              <Input
                id="num-images"
                type="number"
                min="1"
                max="5"
                value={numImages}
                onChange={(e) => setNumImages(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                className="w-full bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Maximum: 5 images per generation</p>
            </div>
          </div>

          {/* Parameters Section */}
          {selectedModel && (
            <>
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Model Parameters</h3>
                {renderParameterFields()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fixed Generate Button at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-950">
        <Button
          className="w-full font-medium h-11 shadow-sm bg-gradient-to-r from-[var(--color-1)] via-[var(--color-3)] to-[var(--color-5)] hover:opacity-90 transition-opacity"
          onClick={onGenerate}
          disabled={!selectedModel || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>Generate {numImages} Image{numImages > 1 ? 's' : ''}</>
          )}
        </Button>
      </div>
    </div>
  )
}
