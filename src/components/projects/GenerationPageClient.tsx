'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import ParameterControlPanel from '@/components/projects/ParameterControlPanel'
import ImageViewerPanel, { ImageSet } from '@/components/projects/ImageViewerPanel'

interface GenerationPageClientProps {
  projectId: string
  userId: string
  isPlayground?: boolean
}

// Define image types
type ImageType = 't1' | 't2' | 'flair' | 'seg' | 't1ce'
const IMAGE_TYPES: ImageType[] = ['t1', 't2', 'flair', 'seg', 't1ce']

export default function GenerationPageClient({ projectId, userId, isPlayground = false }: GenerationPageClientProps) {
  // States for model selection
  const [dimensionType, setDimensionType] = useState<'2D' | '3D'>('2D')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageIds, setGeneratedImageIds] = useState<string[]>([])

  // State for image sets
  const [imageSets, setImageSets] = useState<ImageSet[]>([])
  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(0)
  const [selectedImageType, setSelectedImageType] = useState<ImageType>('flair')
  const [numImages, setNumImages] = useState<number>(1)

  // Model parameters
  const [tumour, setTumour] = useState<string>('With Tumor')
  const [sliceOrientation, setSliceOrientation] = useState<string>('Axial')
  const [sliceLocation, setSliceLocation] = useState<string>('Middle')
  const [resolution, setResolution] = useState<string>('64')

  // Reset selected model when dimension type changes
  useEffect(() => {
    setSelectedModel('')
  }, [dimensionType])

  // Parse image info from generated images
  useEffect(() => {
    const fetchImageDetails = async () => {
      if (generatedImageIds.length === 0) return

      try {
        // For playground mode, generatedImageIds contains direct URLs
        // For authenticated mode, generatedImageIds contains database IDs
        if (isPlayground) {
          // Direct URL processing for playground mode
          const sets: Record<string, ImageSet> = {}
          
          for (const imageUrlsOrUrl of generatedImageIds) {
            // Could be an array of URLs or a single URL
            const urls = Array.isArray(imageUrlsOrUrl) ? imageUrlsOrUrl : [imageUrlsOrUrl]
            const setId = `playground_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            sets[setId] = {
              id: setId,
              name: `Playground Set ${Object.keys(sets).length + 1}`,
              createdAt: new Date().toISOString(),
              images: {
                't1': null,
                't2': null,
                'flair': null,
                'seg': null,
                't1ce': null
              }
            }

            // Map URLs to image types based on filename
            for (const url of urls) {
              if (typeof url === 'string') {
                // Extract image type from URL
                if (url.includes('t1.png')) {
                  sets[setId].images['t1'] = url
                } else if (url.includes('t2.png')) {
                  sets[setId].images['t2'] = url
                } else if (url.includes('flair.png')) {
                  sets[setId].images['flair'] = url
                } else if (url.includes('seg.png')) {
                  sets[setId].images['seg'] = url
                } else if (url.includes('t1ce.png')) {
                  sets[setId].images['t1ce'] = url
                } else if (url.includes('.nii.gz')) {
                  // 3D volume - add to t1 for now
                  sets[setId].images['t1'] = url
                }
              }
            }
          }

          const setsArray = Object.values(sets)
          setImageSets(setsArray)

          // Select first image type that exists in the first set
          if (setsArray.length > 0) {
            setSelectedSetIndex(0)
            const firstSet = setsArray[0]
            const firstAvailableType = IMAGE_TYPES.find(type => firstSet.images[type]) || 'flair'
            setSelectedImageType(firstAvailableType)
          }
        } else {
          // Database fetch for authenticated users
          const response = await fetch('/api/images/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: generatedImageIds }),
          })

          if (response.ok) {
            const data = await response.json()
            console.log('API Response Data:', data)
            const images = data.images || []

            // Process images into sets
            const sets: Record<string, ImageSet> = {}

            for (const image of images) {
              console.log('Image:', image)

              // Extract set name from image name (after the dash)
              const nameParts = image.name.split(' - ')
              const imageType = nameParts[0].toLowerCase() as ImageType
              const setName = nameParts[1] || ''

              if (!sets[setName]) {
                sets[setName] = {
                  id: setName,
                  name: setName,
                  createdAt: image.created_at,
                  images: {
                    't1': null,
                    't2': null,
                    'flair': null,
                    'seg': null,
                    't1ce': null
                  }
                }
              }

              // Add image URL to the set
              if (IMAGE_TYPES.includes(imageType)) {
                sets[setName].images[imageType] = image.file_path
              } else if (image.file_path && image.file_path.includes('.nii.gz')) {
                // If it's a nifti file, add it to one of the existing types
                for (const type of IMAGE_TYPES) {
                  if (!sets[setName].images[type]) {
                    sets[setName].images[type] = image.file_path
                    break
                  }
                }
              }
            }

            // Convert to array and sort by creation date (newest first)
            const setsArray = Object.values(sets).sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            setImageSets(setsArray)

            // Select first image type that exists in the first set
            if (setsArray.length > 0) {
              setSelectedSetIndex(0)
              const firstSet = setsArray[0]
              const firstAvailableType = IMAGE_TYPES.find(type => firstSet.images[type]) || 'flair'
              setSelectedImageType(firstAvailableType)
            }
          } else {
            console.error('Failed to fetch images')
          }
        }
      } catch (error) {
        console.error('Error fetching image details:', error)
      }
    }

    fetchImageDetails()
  }, [generatedImageIds, isPlayground])

  // Prepare parameters based on selected model
  const getModelParams = () => {
    if (!selectedModel) return {}

    if (selectedModel === 'braingen_GAN_seg_TCGA_v1 (2D)') {
      return { tumour }
    }

    if (selectedModel.includes('braingen_cGAN_Multicontrast') ||
        selectedModel === 'braingen_WaveletGAN_Multicontrast_BraTS_v1 (2D)') {
      return {
        tumour,
        slice_orientation: sliceOrientation,
        slice_location: sliceLocation
      }
    }

    if (selectedModel === 'braingen_gan3d_BraTS_64_v1 (3D)') {
      return { resolution }
    }

    return {}
  }

  // Generate image function
  const generateImage = async () => {
    if (!selectedModel) {
      toast({
        title: "Error",
        description: "Please select a model",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const requestBody = {
        user_id: userId,
        project_id: projectId,
        model_name: selectedModel,
        n_images: numImages,
        params: getModelParams(),
        is_playground: isPlayground
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Error generating image')
      }

      const data = await response.json()
      setGeneratedImageIds(data.image_ids)
      toast({
        title: "Success",
        description: `Generated ${numImages} image set${numImages > 1 ? 's' : ''}`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 flex">
      <ParameterControlPanel
        dimensionType={dimensionType}
        setDimensionType={setDimensionType}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        numImages={numImages}
        setNumImages={setNumImages}
        tumour={tumour}
        setTumour={setTumour}
        sliceOrientation={sliceOrientation}
        setSliceOrientation={setSliceOrientation}
        sliceLocation={sliceLocation}
        setSliceLocation={setSliceLocation}
        resolution={resolution}
        setResolution={setResolution}
        isGenerating={isGenerating}
        onGenerate={generateImage}
      />
      <ImageViewerPanel
        dimensionType={dimensionType}
        imageSets={imageSets}
        isGenerating={isGenerating}
        numImages={numImages}
        selectedSetIndex={selectedSetIndex}
        setSelectedSetIndex={setSelectedSetIndex}
        selectedImageType={selectedImageType}
        setSelectedImageType={setSelectedImageType}
      />
    </div>
  )
}
