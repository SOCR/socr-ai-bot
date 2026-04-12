'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

interface GeneratedImage {
  id: string
  name: string
  file_path: string
  created_at: string
  parameters_used: any
}

interface RecentGenerationsProps {
  projectId: string
}

export default function RecentGenerations({ projectId }: RecentGenerationsProps) {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchRecentGenerations = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/images`)
        
        if (response.ok) {
          const data = await response.json()
          setImages(data.images)
        } else {
          console.error('Failed to fetch recent generations')
        }
      } catch (error) {
        console.error('Error fetching generations:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecentGenerations()
  }, [projectId])
  
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    )
  }
  
  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No images generated yet.
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map(image => (
        <Card key={image.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video w-full">
              {image.file_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={image.file_path} 
                  alt={image.name}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No preview</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-medium truncate">{image.name}</h4>
              <p className="text-sm text-gray-500">
                {new Date(image.created_at).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 