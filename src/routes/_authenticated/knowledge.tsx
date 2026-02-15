import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner' // Assuming 'sonner' is the toast library
import { env } from '@/env' // Assuming '@/env' provides the environment variables

// Types
interface KnowledgeDoc {
  id: string
  filename: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  upload_timestamp: string
  size_bytes: number
  error?: string
}

interface FileUploadItem {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  message?: string
}

export const Route = createFileRoute('/_authenticated/knowledge')({
  component: RouteComponent,
})

function RouteComponent() {
  const [files, setFiles] = useState<FileUploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Load docs on mount
  useEffect(() => {
    fetchDocs()
  }, [])

  const fetchDocs = async () => {
    try {
      const response = await fetch(`${env.VITE_API_URL}/support/chat/files`, {
        // Headers should be handled by an interceptor or auth hook in a real app
        // For now assuming the proxy handles it or we need to grab token
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}` // Example
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDocs(data.files || [])
      }
    } catch (error) {
      console.error("Failed to fetch docs", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    try {
      const response = await fetch(`${env.VITE_API_URL}/support/chat/files/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      if (response.ok) {
        toast({ title: "File deleted" })
        fetchDocs()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({ title: "Error deleting file", variant: "destructive" })
    }
  }

  // File Handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
      e.target.value = '' // reset
    }
  }

  const addFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).filter((file) => {
      // Basic validation
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
      ]
      // Also allow by extension roughly
      const isValid =
        validTypes.includes(file.type) ||
        /\.(pdf|docx|txt|md|csv)$/i.test(file.name)

      if (!isValid) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name} is not supported. Use PDF, DOCX, TXT, or CSV.`,
          variant: 'destructive',
        })
        return false
      }
      return true
    })

    const items: FileUploadItem[] = newFiles.map((file) => ({
      file,
      status: 'pending',
    }))
    setFiles((prev) => [...prev, ...items])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Upload Logic
  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue

      setFiles(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'uploading' } : item
      ))

      try {
        const formData = new FormData()
        formData.append('file', files[i].file)

        const response = await fetch(`${env.VITE_API_URL}/support/chat/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        })

        if (response.ok) {
          setFiles(prev => prev.map((item, idx) =>
            idx === i ? { ...item, status: 'success' } : item
          ))
        } else {
          throw new Error('Upload failed')
        }

      } catch (err) {
        setFiles(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'error', message: 'Failed' } : item
        ))
      }
    }

    setIsUploading(false)
    toast({
      title: "Upload Complete",
      description: "Your documents are being processed by the AI.",
    })
    fetchDocs() // Refresh list
  }
}
