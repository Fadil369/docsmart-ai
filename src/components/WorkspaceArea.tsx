import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Translate, 
  Lightning, 
  Merge, 
  ChartBar, 
  Brain, 
  Share, 
  Users, 
  FileText, 
  Copy, 
  Download,
  ArrowUp,
  CircleNotch
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface WorkspaceAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  description: string
  color: string
  isLoading?: boolean
  progress?: number
}

interface WorkspaceAreaProps {
  onActionClick: (actionId: string, files?: File[]) => void
  activeActions: string[]
  actionProgress: Record<string, number>
}

export function WorkspaceArea({ onActionClick, activeActions, actionProgress }: WorkspaceAreaProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const workspaceActions: WorkspaceAction[] = [
    {
      id: 'upload',
      label: 'Upload',
      icon: Upload,
      description: 'Upload documents instantly',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: Translate,
      description: 'AR ⇄ EN translation',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'compress',
      label: 'Compress',
      icon: Lightning,
      description: 'Reduce file size smartly',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'merge',
      label: 'Merge & Consolidate',
      icon: MagnetStraight,
      description: 'Combine multiple documents',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'analyze',
      label: 'Analyze',
      icon: ChartBar,
      description: 'Extract insights & data',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      id: 'ai-analyze',
      label: 'AI Copilot Analysis',
      icon: Brain,
      description: 'Powered by AI intelligence',
      color: 'bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600'
    },
    {
      id: 'share',
      label: 'Share',
      icon: Share,
      description: 'Share with team members',
      color: 'bg-cyan-500 hover:bg-cyan-600'
    },
    {
      id: 'collaborate',
      label: 'Collaborate',
      icon: Users,
      description: 'Real-time collaboration',
      color: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      id: 'template',
      label: 'Make Template',
      icon: FileText,
      description: 'Create reusable template',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'copy',
      label: 'Make Copy',
      icon: Copy,
      description: 'Duplicate document',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      description: 'Download in various formats',
      color: 'bg-emerald-500 hover:bg-emerald-600'
    }
  ]

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setSelectedFiles(files)
      onActionClick('upload', files)
      toast.success(`${files.length} file(s) uploaded successfully`)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(files)
      onActionClick('upload', files)
      toast.success(`${files.length} file(s) selected`)
    }
  }

  const handleActionClick = (actionId: string) => {
    if (activeActions.includes(actionId)) {
      toast.info('Action already in progress...')
      return
    }
    onActionClick(actionId, selectedFiles)
  }

  return (
    <div className="space-y-8">
      {/* Main Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative border-2 border-dashed rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300",
          dragActive 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-accent/20"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-3 sm:space-y-4">
          <motion.div
            animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUp size={isMobile ? 32 : 48} className="mx-auto text-primary" />
          </motion.div>
          
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold">
              {dragActive ? 'Drop files here!' : 'Drag & Drop Any Document'}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Supports PDF, Excel, Word, PowerPoint, Images, and more
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <input
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="w-full sm:w-auto">
              <Button size="lg" className="cursor-pointer w-full sm:w-auto">
                <Upload className="mr-2" size={16} />
                Choose Files
              </Button>
            </label>
            
            {selectedFiles.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {selectedFiles.length} file(s) selected
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">AI-Powered Workspace</h2>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                Transform your documents with intelligent processing tools
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              <AnimatePresence>
                {workspaceActions.map((action, index) => {
                  const isActive = activeActions.includes(action.id)
                  const progress = actionProgress[action.id] || 0
                  const Icon = action.icon

                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className={cn(
                          "h-auto p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 relative overflow-hidden text-xs sm:text-sm",
                          "hover:shadow-lg transition-all duration-300 min-h-[80px] sm:min-h-[100px]",
                          isActive && "ring-2 ring-primary"
                        )}
                        onClick={() => handleActionClick(action.id)}
                        disabled={isActive}
                      >
                        {/* Progress Background */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-primary/10"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        )}

                        {/* Icon with Loading State */}
                        <div className="relative">
                          {isActive ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <CircleNotch size={24} className="text-primary" />
                            </motion.div>
                          ) : (
                            <Icon size={24} className="text-foreground" />
                          )}
                        </div>

                        {/* Label */}
                        <div className="text-center">
                          <div className="font-medium text-sm">{action.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {action.description}
                          </div>
                        </div>

                        {/* Progress Bar for Active Actions */}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0">
                            <Progress value={progress} className="h-1" />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {selectedFiles.length}
                </div>
                <div className="text-sm text-muted-foreground">Files Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {activeActions.length}
                </div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">AI</div>
                <div className="text-sm text-muted-foreground">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">∞</div>
                <div className="text-sm text-muted-foreground">Unlimited</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}