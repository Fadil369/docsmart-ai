import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Clock, 
  Users, 
  Bell, 
  FolderOpen,
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  Circle,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  X
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useKV } from '@github/spark/hooks'
import { useSidebar } from '@/lib/use-sidebar'

interface Document {
  id: string
  name: string
  type: string
  status: 'processing' | 'completed' | 'error' | 'queued'
  progress: number
  lastModified: Date
  size: number
  collaborators: string[]
}

interface Activity {
  id: string
  type: 'upload' | 'process' | 'share' | 'collaborate' | 'export'
  message: string
  timestamp: Date
  user: string
  documentId?: string
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  status: 'online' | 'away' | 'offline'
  lastSeen: Date
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
}

export function AppSidebar() {
  const { isOpen, isMobile, close } = useSidebar()
  const [documents] = useKV<Document[]>('ongoing-documents', [])
  const [activities] = useKV<Activity[]>('live-activities', [])
  const [teamMembers] = useKV<TeamMember[]>('team-members', [])
  const [notifications] = useKV<Notification[]>('notifications', [])
  const [activeTab, setActiveTab] = useState<'documents' | 'activity' | 'team' | 'drive' | 'notifications'>('documents')

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('.sidebar-content')) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, isOpen, close])

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return <Zap size={16} className="text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />
      case 'queued':
        return <Clock size={16} className="text-orange-500" />
      default:
        return <Circle size={16} className="text-gray-400" />
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return <FileText size={16} className="text-blue-500" />
      case 'process':
        return <Zap size={16} className="text-purple-500" />
      case 'share':
        return <Share2 size={16} className="text-green-500" />
      case 'collaborate':
        return <Users size={16} className="text-orange-500" />
      case 'export':
        return <Download size={16} className="text-indigo-500" />
      default:
        return <Activity size={16} className="text-gray-400" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: activities.length },
    { id: 'team', label: 'Team', icon: Users, count: teamMembers.filter(m => m.status === 'online').length },
    { id: 'drive', label: 'Drive', icon: FolderOpen, count: 0 },
    { id: 'notifications', label: 'Alerts', icon: Bell, count: notifications.filter(n => !n.read).length }
  ]

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : isMobile ? -320 : 0,
          width: isOpen ? 320 : isMobile ? 320 : 0,
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1]
        }}
        className={cn(
          "fixed lg:relative top-0 left-0 h-screen bg-card border-r border-border flex flex-col z-50 sidebar-content",
          "overflow-hidden",
          !isOpen && !isMobile && "w-0 border-r-0"
        )}
      >
        <div className="w-80 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Activity size={18} className="text-primary-foreground" />
                </div>
                <span className="font-semibold">Workspace</span>
              </div>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={close}
                  className="h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    className="relative h-8 text-xs justify-start"
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    <Icon size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                    {tab.count > 0 && (
                      <Badge variant="secondary" className="ml-auto h-4 min-w-4 text-[10px] px-1">
                        {tab.count > 99 ? '99+' : tab.count}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              <AnimatePresence mode="wait">
                {/* Ongoing Documents */}
                {activeTab === 'documents' && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                      Your Ongoing Documents
                    </h3>
                    {documents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents yet</p>
                      </div>
                    ) : (
                      documents.map((doc) => (
                        <Card key={doc.id} className="p-3 hover:shadow-md transition-all duration-200">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.size)} • {formatRelativeTime(doc.lastModified)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                {getStatusIcon(doc.status)}
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal size={14} />
                                </Button>
                              </div>
                            </div>
                            
                            {doc.status === 'processing' && (
                              <div className="space-y-1">
                                <Progress value={doc.progress} className="h-1" />
                                <p className="text-xs text-muted-foreground">
                                  Processing... {doc.progress}%
                                </p>
                              </div>
                            )}

                            {doc.collaborators.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users size={12} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {doc.collaborators.length} collaborator{doc.collaborators.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Live Activity Feed */}
                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                      Live Activity Feed
                    </h3>
                    {activities.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-shrink-0 mt-0.5">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{activity.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{activity.user}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Team Online */}
                {activeTab === 'team' && (
                  <motion.div
                    key="team"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                      Team Online
                    </h3>
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No team members</p>
                      </div>
                    ) : (
                      teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                              member.status === 'online' && "bg-green-500",
                              member.status === 'away' && "bg-yellow-500",
                              member.status === 'offline' && "bg-gray-400"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {member.status === 'offline' ? `Last seen ${formatRelativeTime(member.lastSeen)}` : member.status}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Drive Documents */}
                {activeTab === 'drive' && (
                  <motion.div
                    key="drive"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                      Drive Documents
                    </h3>
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderOpen size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drive integration coming soon</p>
                    </div>
                  </motion.div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                      Notifications
                    </h3>
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <Card key={notification.id} className={cn(
                          "p-3 transition-all duration-200 hover:shadow-md",
                          !notification.read && "border-primary/50 bg-primary/5"
                        )}>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(notification.timestamp)}
                            </p>
                          </div>
                        </Card>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </>
  )
}