import { useState, useCallback } from 'react'
import { CloudArrowUp, Document, X } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  progress: number
}

interface DocumentUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
}

export function DocumentUpload({ onFilesUploaded }: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }, [])

  const processFiles = useCallback((files: File[]) => {
    const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    
    const validFiles = files.filter(file => supportedTypes.includes(file.type))
    
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id)
    })

    onFilesUploaded(newFiles)
  }, [onFilesUploaded])

  const simulateUpload = useCallback((fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 25
      
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, progress: Math.min(progress, 100) }
            : file
        )
      )

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map(file => 
              file.id === fileId 
                ? { ...file, status: 'ready', progress: 100 }
                : file
            )
          )
        }, 500)
      }
    }, 200)
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    return '📎'
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'bg-accent'
      case 'processing': return 'bg-primary'
      case 'ready': return 'bg-success'
      case 'error': return 'bg-destructive'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className={cn(
            "relative border-2 border-dashed transition-all duration-200 hover:border-primary/50",
            isDragOver ? "border-primary bg-primary/5" : "border-border"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-12 text-center">
            <motion.div
              animate={{ scale: isDragOver ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <CloudArrowUp 
                size={48} 
                className={cn(
                  "mx-auto transition-colors duration-200",
                  isDragOver ? "text-primary" : "text-muted-foreground"
                )}
              />
            </motion.div>
            
            <h3 className="text-lg font-semibold mb-2">
              Drop your documents here
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Support for PDF and Excel files up to 10MB each
            </p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileSelect}
            />
            
            <Button asChild variant="outline" size="lg">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Document size={20} className="mr-2" />
                Choose Files
              </label>
            </Button>
          </div>
        </Card>
      </motion.div>

      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <h4 className="font-medium text-foreground">Uploaded Files</h4>
          
          {uploadedFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileTypeIcon(file.type)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={file.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(file.status))}
                    >
                      {file.status}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}