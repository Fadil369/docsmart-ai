import { useState, useEffect } from 'react'
import { Users, Eye, Edit, Clock, Zap, MessageCircle, Bell, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface CollaborativeActivity {
  id: string
  type: 'template_created' | 'template_shared' | 'template_used' | 'template_rated' | 'team_joined' | 'comment_added'
  userId: string
  userName: string
  userAvatar?: string
  templateName?: string
  templateId?: string
  description: string
  timestamp: Date
  metadata?: {
    rating?: number
    comment?: string
    sharedWith?: string[]
  }
}

interface OnlineUser {
  id: string
  name: string
  avatar?: string
  currentTemplate?: string
  lastSeen: Date
  isEditing: boolean
}

interface CollaborationNotification {
  id: string
  type: 'share_request' | 'template_update' | 'mention' | 'approval_needed'
  title: string
  message: string
  fromUser: string
  templateId?: string
  timestamp: Date
  read: boolean
  actionRequired: boolean
}

interface LiveCollaborationProps {
  className?: string
}

export function LiveCollaboration({ className }: LiveCollaborationProps) {
  const [activities, setActivities] = useKV<CollaborativeActivity[]>('collaboration-activities', [])
  const [onlineUsers, setOnlineUsers] = useKV<OnlineUser[]>('online-users', [])
  const [notifications, setNotifications] = useKV<CollaborationNotification[]>('collaboration-notifications', [])
  const [newComment, setNewComment] = useState('')
  const [showAllActivities, setShowAllActivities] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random collaborative activities
      if (Math.random() > 0.7) {
        const mockActivities: CollaborativeActivity[] = [
          {
            id: Date.now().toString(),
            type: 'template_used',
            userId: 'user-1',
            userName: 'Sarah Chen',
            userAvatar: 'SC',
            templateName: 'Legal Contract Analysis',
            templateId: 'template-1',
            description: 'Used Legal Contract Analysis template for document processing',
            timestamp: new Date()
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'template_rated',
            userId: 'user-2',
            userName: 'Ahmed Hassan',
            userAvatar: 'AH',
            templateName: 'Financial Report Analysis',
            templateId: 'template-2',
            description: 'Rated Financial Report Analysis template',
            timestamp: new Date(),
            metadata: {
              rating: 5,
              comment: 'Excellent template for quarterly reports!'
            }
          }
        ]

        const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)]
        setActivities(current => [randomActivity, ...current.slice(0, 19)]) // Keep only last 20
      }

      // Update online users
      setOnlineUsers(current => 
        current.map(user => ({
          ...user,
          lastSeen: new Date(),
          isEditing: Math.random() > 0.8
        }))
      )
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [setActivities, setOnlineUsers])

  // Initialize with sample data
  useEffect(() => {
    if (onlineUsers.length === 0) {
      const sampleUsers: OnlineUser[] = [
        {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: 'SC',
          currentTemplate: 'Legal Contract Analysis',
          lastSeen: new Date(),
          isEditing: true
        },
        {
          id: 'user-2',
          name: 'Ahmed Hassan',
          avatar: 'AH',
          currentTemplate: 'Financial Report Template',
          lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          isEditing: false
        },
        {
          id: 'user-3',
          name: 'Maria Rodriguez',
          avatar: 'MR',
          lastSeen: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          isEditing: false
        }
      ]
      setOnlineUsers(sampleUsers)
    }

    if (notifications.length === 0) {
      const sampleNotifications: CollaborationNotification[] = [
        {
          id: 'notif-1',
          type: 'share_request',
          title: 'Template Share Request',
          message: 'Sarah Chen wants to share "Legal Contract Analysis" template with you',
          fromUser: 'Sarah Chen',
          templateId: 'template-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
          actionRequired: true
        },
        {
          id: 'notif-2',
          type: 'template_update',
          title: 'Template Updated',
          message: 'Ahmed Hassan updated "Financial Report Analysis" template',
          fromUser: 'Ahmed Hassan',
          templateId: 'template-2',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          read: false,
          actionRequired: false
        }
      ]
      setNotifications(sampleNotifications)
    }
  }, [onlineUsers.length, notifications.length, setOnlineUsers, setNotifications])

  const unreadNotifications = notifications.filter(n => !n.read)
  const recentActivities = showAllActivities ? activities : activities.slice(0, 8)

  const handleMarkNotificationRead = (notificationId: string) => {
    setNotifications(current =>
      current.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const activity: CollaborativeActivity = {
      id: Date.now().toString(),
      type: 'comment_added',
      userId: 'current-user',
      userName: 'You',
      description: newComment,
      timestamp: new Date(),
      metadata: {
        comment: newComment
      }
    }

    setActivities(current => [activity, ...current])
    setNewComment('')
    toast.success('Comment added to activity feed')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'template_created': return <Zap size={14} className="text-accent" />
      case 'template_shared': return <Users size={14} className="text-primary" />
      case 'template_used': return <Eye size={14} className="text-success" />
      case 'template_rated': return <span className="text-yellow-500">★</span>
      case 'team_joined': return <Users size={14} className="text-secondary" />
      case 'comment_added': return <MessageCircle size={14} className="text-muted-foreground" />
      default: return <Clock size={14} className="text-muted-foreground" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="text-primary" size={20} />
                    Live Activity Feed
                  </CardTitle>
                  <CardDescription>
                    Real-time collaboration updates from your team
                  </CardDescription>
                </div>
                
                {activities.length > 8 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAllActivities(!showAllActivities)}
                  >
                    {showAllActivities ? 'Show Less' : `Show All (${activities.length})`}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Add Comment */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Share an update with your team..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <MessageCircle size={14} />
                  </Button>
                </div>

                <Separator />

                {/* Activity List */}
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {recentActivities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={activity.userAvatar} />
                            <AvatarFallback className="text-xs">
                              {activity.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {getActivityIcon(activity.type)}
                              <p className="text-sm">
                                <span className="font-medium">{activity.userName}</span>{' '}
                                {activity.description}
                                {activity.templateName && (
                                  <span className="text-primary font-medium">
                                    {' '}{activity.templateName}
                                  </span>
                                )}
                              </p>
                            </div>
                            
                            {activity.metadata?.comment && (
                              <div className="mt-1 p-2 bg-muted/50 rounded text-sm">
                                "{activity.metadata.comment}"
                              </div>
                            )}
                            
                            {activity.metadata?.rating && (
                              <div className="mt-1 flex items-center gap-1">
                                {Array.from({ length: activity.metadata.rating }, (_, i) => (
                                  <span key={i} className="text-yellow-500 text-sm">★</span>
                                ))}
                              </div>
                            )}

                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Online Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-success" size={20} />
                Team Online
                <Badge variant="secondary">{onlineUsers.length}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {onlineUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {user.isEditing && (
                          <Edit size={12} className="text-accent" />
                        )}
                      </div>
                      {user.currentTemplate && (
                        <p className="text-xs text-muted-foreground truncate">
                          Working on {user.currentTemplate}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(user.lastSeen)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-primary" size={20} />
                Notifications
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive">{unreadNotifications.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        notification.read 
                          ? 'bg-muted/30 border-muted' 
                          : 'bg-accent/10 border-accent/20 hover:bg-accent/20'
                      }`}
                      onClick={() => handleMarkNotificationRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <div className="h-2 w-2 bg-accent rounded-full" />
                        )}
                      </div>
                      
                      {notification.actionRequired && !notification.read && (
                        <div className="mt-2 flex gap-1">
                          <Button size="sm" className="h-6 px-2 text-xs">
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                            Decline
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}