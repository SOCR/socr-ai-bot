'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import ImageSetCard, { ImageSet } from './ImageSetCard'
import ImageSetDetailModal from './ImageSetDetailModal'
import { Loader2, Filter } from 'lucide-react'

interface LibraryPageClientProps {
  projectId: string
  userId: string
}

type ImageType = 't1' | 't2' | 'flair' | 'seg' | 't1ce'
const IMAGE_TYPES: ImageType[] = ['t1', 't2', 'flair', 'seg', 't1ce']

interface GeneratedImage {
  id: string
  name: string
  file_path: string
  created_at: string
  model_name?: string
  dimension_type?: '2D' | '3D'
}

export default function LibraryPageClient({ projectId, userId }: LibraryPageClientProps) {
  const [imageSets, setImageSets] = useState<ImageSet[]>([])
  const [filteredSets, setFilteredSets] = useState<ImageSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSet, setSelectedSet] = useState<ImageSet | null>(null)
  const [dimensionFilter, setDimensionFilter] = useState<'all' | '2D' | '3D'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null)

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/images/project/${projectId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }

        const data = await response.json()
        const images: GeneratedImage[] = data.images || []

        // Group images into sets
        const sets: Record<string, ImageSet> = {}

        for (const image of images) {
          // Extract set name from image name (format: "type - setname")
          const nameParts = image.name.split(' - ')
          const imageType = nameParts[0].toLowerCase() as ImageType
          const setName = nameParts[1] || ''

          if (!sets[setName]) {
            // Determine dimension type from model name or file extension
            const dimensionType: '2D' | '3D' =
              image.dimension_type ||
              (image.file_path?.includes('.nii.gz') ? '3D' : '2D') ||
              (image.model_name?.includes('3D') ? '3D' : '2D')

            sets[setName] = {
              id: setName,
              name: setName,
              createdAt: image.created_at,
              dimensionType,
              model: image.model_name || 'Unknown Model',
              imageCount: 0,
              thumbnailUrl: null,
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
            sets[setName].imageCount++

            // Use first available image as thumbnail
            if (!sets[setName].thumbnailUrl) {
              sets[setName].thumbnailUrl = image.file_path
            }
          } else if (image.file_path?.includes('.nii.gz')) {
            // 3D volume - store in the first available slot or t1
            sets[setName].images['t1'] = image.file_path
            sets[setName].imageCount++
          }
        }

        // Convert to array and sort
        const setsArray = Object.values(sets)
        setImageSets(setsArray)
        setFilteredSets(setsArray)
      } catch (error) {
        console.error('Error fetching images:', error)
        toast({
          title: "Error",
          description: "Failed to load image library",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [projectId])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...imageSets]

    // Filter by dimension
    if (dimensionFilter !== 'all') {
      filtered = filtered.filter(set => set.dimensionType === dimensionFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    setFilteredSets(filtered)
  }, [imageSets, dimensionFilter, sortBy])

  const handleView = (imageSet: ImageSet) => {
    setSelectedSet(imageSet)
  }

  const handleDownload = async (imageSet: ImageSet) => {
    toast({
      title: "Download Started",
      description: `Downloading ${imageSet.name}...`,
    })
    // TODO: Implement actual download logic
    // For now, just open images in new tabs
    Object.values(imageSet.images).forEach(url => {
      if (url) {
        window.open(url, '_blank')
      }
    })
  }

  const handleDelete = async (imageSet: ImageSet) => {
    if (!confirm(`Are you sure you want to delete "${imageSet.name}"? This action cannot be undone.`)) {
      return
    }

    setDeletingSetId(imageSet.id)

    try {
      // TODO: Implement delete API endpoint
      // For now, just remove from UI
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setImageSets(prev => prev.filter(set => set.id !== imageSet.id))

      toast({
        title: "Deleted",
        description: `"${imageSet.name}" has been deleted`,
      })
    } catch (error) {
      console.error('Error deleting image set:', error)
      toast({
        title: "Error",
        description: "Failed to delete image set",
        variant: "destructive"
      })
    } finally {
      setDeletingSetId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400">Loading library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header with filters */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Image Library</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredSets.length} image set{filteredSets.length !== 1 ? 's' : ''}
            </p>
          </div>

          {imageSets.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Label className="text-sm text-gray-600 dark:text-gray-400">Type:</Label>
                <Select value={dimensionFilter} onValueChange={(value: any) => setDimensionFilter(value)}>
                  <SelectTrigger className="h-9 w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="2D">2D</SelectItem>
                    <SelectItem value="3D">3D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600 dark:text-gray-400">Sort:</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="h-9 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredSets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative h-16 w-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-1)] via-[var(--color-3)] to-[var(--color-5)] opacity-20"></div>
                <Filter className="relative h-16 w-16 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {imageSets.length === 0 ? 'No Images Yet' : 'No Results'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {imageSets.length === 0
                  ? 'Generate your first images to populate this library'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSets.map((set) => (
              <ImageSetCard
                key={set.id}
                imageSet={set}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
                isDeleting={deletingSetId === set.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ImageSetDetailModal
        imageSet={selectedSet}
        open={selectedSet !== null}
        onClose={() => setSelectedSet(null)}
        onDownload={handleDownload}
      />
    </div>
  )
}
