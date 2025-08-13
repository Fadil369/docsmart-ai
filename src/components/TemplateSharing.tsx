import { useState, useEffect } from 'react'
import { Users, Share, Download, Upload, Copy, Globe, Lock, UserCheck, UserX, Crown, Plus, Send, Search, Filter, GitBranch, Clock } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@/lib/mock-spark'
import { AnalysisTemplate } from './AnalysisTemplates'
import { TemplateVersionControl } from './TemplateVersionControl'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date | string
  lastActive: Date | string
  isOnline: boolean
}

interface SharedTemplate {
  id: string
  template: AnalysisTemplate
  sharedBy: TeamMember
  sharedAt: Date | string
  visibility: 'team' | 'public' | 'private'
  permissions: {
    canEdit: boolean
    canShare: boolean
    canDelete: boolean
  }
  usageCount: number
  ratings: Array<{
    userId: string
    rating: number
    comment?: string
  }>
  averageRating: number
  tags: string[]
  category: string
}

interface ShareRequest {
  id: string
  templateId: string
  fromUser: TeamMember
  toUser: TeamMember
  message: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date | string
}

interface TemplateSharingProps {
  isOpen: boolean
  onClose: () => void
}

export function TemplateSharing({ isOpen, onClose }: TemplateSharingProps) {
  const [sharedTemplates, setSharedTemplates] = useKV<SharedTemplate[]>('shared-templates', [])
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('team-members', [])
  const [shareRequests, setShareRequests] = useKV<ShareRequest[]>('share-requests', [])
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'popular'>('recent')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AnalysisTemplate | null>(null)
  const [showVersionControl, setShowVersionControl] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  // Mock current user - in real app this would come from auth
  const currentUser: TeamMember = {
    id: 'current-user',
    name: 'You',
    email: 'you@company.com',
    role: 'admin',
    joinedAt: new Date(),
    lastActive: new Date(),
    isOnline: true
  }

  // Initialize with sample data
  useEffect(() => {
    if (teamMembers.length === 0) {
      const sampleTeam: TeamMember[] = [
        {
          id: 'user-1',
          name: 'Sarah Chen',
          email: 'sarah@company.com',
          avatar: 'SC',
          role: 'owner',
          joinedAt: new Date('2024-01-15'),
          lastActive: new Date(),
          isOnline: true
        },
        {
          id: 'user-2',
          name: 'Ahmed Hassan',
          email: 'ahmed@company.com',
          avatar: 'AH',
          role: 'admin',
          joinedAt: new Date('2024-02-01'),
          lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isOnline: false
        },
        {
          id: 'user-3',
          name: 'Maria Rodriguez',
          email: 'maria@company.com',
          avatar: 'MR',
          role: 'member',
          joinedAt: new Date('2024-03-10'),
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          isOnline: true
        }
      ]
      setTeamMembers(sampleTeam)
    }
  }, [teamMembers.length, setTeamMembers])

  const filteredTemplates = sharedTemplates
    .filter(template => {
      const matchesSearch = template.template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averageRating - a.averageRating
        case 'popular':
          return b.usageCount - a.usageCount
        default:
          return new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()
      }
    })

  const handleShareTemplate = (template: AnalysisTemplate, shareData: {
    visibility: 'team' | 'public' | 'private'
    selectedMembers?: string[]
    message?: string
    category: string
  }) => {
    const sharedTemplate: SharedTemplate = {
      id: Date.now().toString(),
      template,
      sharedBy: currentUser,
      sharedAt: new Date(),
      visibility: shareData.visibility,
      permissions: {
        canEdit: false,
        canShare: true,
        canDelete: false
      },
      usageCount: 0,
      ratings: [],
      averageRating: 0,
      tags: template.documentTypes,
      category: shareData.category
    }

    setSharedTemplates(current => [...current, sharedTemplate])
    
    // Create share requests for specific members if needed
    if (shareData.selectedMembers && shareData.selectedMembers.length > 0) {
      const requests: ShareRequest[] = shareData.selectedMembers.map(memberId => ({
        id: `${template.id}-${memberId}-${Date.now()}`,
        templateId: sharedTemplate.id,
        fromUser: currentUser,
        toUser: teamMembers.find(m => m.id === memberId)!,
        message: shareData.message || '',
        status: 'pending',
        createdAt: new Date()
      }))
      
      setShareRequests(current => [...current, ...requests])
    }

    toast.success('Template shared successfully!')
    setShowShareDialog(false)
  }

  const handleAcceptShareRequest = (requestId: string) => {
    setShareRequests(current =>
      current.map(req => req.id === requestId ? { ...req, status: 'accepted' as const } : req)
    )
    toast.success('Share request accepted')
  }

  const handleDeclineShareRequest = (requestId: string) => {
    setShareRequests(current =>
      current.map(req => req.id === requestId ? { ...req, status: 'declined' as const } : req)
    )
    toast.success('Share request declined')
  }

  const handleRateTemplate = (templateId: string, rating: number, comment?: string) => {
    setSharedTemplates(current =>
      current.map(template => {
        if (template.id === templateId) {
          const existingRatingIndex = template.ratings.findIndex(r => r.userId === currentUser.id)
          const newRatings = [...template.ratings]
          
          if (existingRatingIndex >= 0) {
            newRatings[existingRatingIndex] = { userId: currentUser.id, rating, comment }
          } else {
            newRatings.push({ userId: currentUser.id, rating, comment })
          }
          
          const averageRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length
          
          return {
            ...template,
            ratings: newRatings,
            averageRating
          }
        }
        return template
      })
    )
    toast.success('Template rated successfully')
  }

  const pendingRequests = shareRequests.filter(req => 
    req.toUser.id === currentUser.id && req.status === 'pending'
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="text-primary" size={20} />
            Template Collaboration Hub
          </DialogTitle>
          <DialogDescription>
            Share and discover analysis templates with your team
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="browse">
                  Browse Templates
                  {sharedTemplates.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {sharedTemplates.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="requests">
                  Share Requests
                  {pendingRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="team">Team Members ({teamMembers.length})</TabsTrigger>
                <TabsTrigger value="my-shares">My Shared Templates</TabsTrigger>
                <TabsTrigger value="versions">Version Control</TabsTrigger>
              </TabsList>

              <Button onClick={() => setShowShareDialog(true)}>
                <Share size={14} className="mr-1" />
                Share Template
              </Button>
            </div>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="browse" className="h-full">
                <div className="space-y-4 h-full">
                  {/* Search and Filter Bar */}
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40">
                        <Filter size={14} className="mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: 'recent' | 'rating' | 'popular') => setSortBy(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="popular">Most Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Templates Grid */}
                  <ScrollArea className="flex-1">
                    {filteredTemplates.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="max-w-md mx-auto space-y-4">
                          <div className="text-4xl">🤝</div>
                          <h3 className="text-lg font-semibold">No shared templates yet</h3>
                          <p className="text-muted-foreground text-sm">
                            Be the first to share a template with your team
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((sharedTemplate, index) => (
                          <SharedTemplateCard
                            key={sharedTemplate.id}
                            sharedTemplate={sharedTemplate}
                            index={index}
                            currentUser={currentUser}
                            onRate={handleRateTemplate}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="requests" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Pending Share Requests</h3>
                      <Badge variant="secondary">
                        {pendingRequests.length} pending
                      </Badge>
                    </div>

                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="max-w-md mx-auto space-y-4">
                          <div className="text-4xl">📬</div>
                          <h3 className="text-lg font-semibold">No pending requests</h3>
                          <p className="text-muted-foreground text-sm">
                            You're all caught up! New share requests will appear here.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingRequests.map((request, index) => (
                          <ShareRequestCard
                            key={request.id}
                            request={request}
                            index={index}
                            onAccept={() => handleAcceptShareRequest(request.id)}
                            onDecline={() => handleDeclineShareRequest(request.id)}
                          />
                        ))}
                      </div>
                    )}

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Recent Activity</h3>
                      <div className="space-y-3">
                        {shareRequests
                          .filter(req => req.status !== 'pending')
                          .slice(0, 5)
                          .map((request, index) => (
                            <div key={request.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={request.fromUser.avatar} />
                                <AvatarFallback>{request.fromUser.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">{request.fromUser.name}</span>
                                  {request.status === 'accepted' ? ' shared a template with you' : ' template share was declined'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                                {request.status}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="team" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Team Members</h3>
                      <Button variant="outline" size="sm">
                        <Plus size={14} className="mr-1" />
                        Invite Member
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[currentUser, ...teamMembers].map((member, index) => (
                        <TeamMemberCard
                          key={member.id}
                          member={member}
                          index={index}
                          isCurrentUser={member.id === currentUser.id}
                        />
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="my-shares" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Templates You've Shared</h3>
                      <Badge variant="secondary">
                        {sharedTemplates.filter(t => t.sharedBy.id === currentUser.id).length} shared
                      </Badge>
                    </div>

                    {sharedTemplates.filter(t => t.sharedBy.id === currentUser.id).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="max-w-md mx-auto space-y-4">
                          <div className="text-4xl">📤</div>
                          <h3 className="text-lg font-semibold">No shared templates</h3>
                          <p className="text-muted-foreground text-sm">
                            Share your first template to help your team be more productive
                          </p>
                          <Button onClick={() => setShowShareDialog(true)}>
                            <Share size={14} className="mr-1" />
                            Share Template
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sharedTemplates
                          .filter(t => t.sharedBy.id === currentUser.id)
                          .map((sharedTemplate, index) => (
                            <SharedTemplateCard
                              key={sharedTemplate.id}
                              sharedTemplate={sharedTemplate}
                              index={index}
                              currentUser={currentUser}
                              onRate={handleRateTemplate}
                              showOwnerActions
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="versions" className="h-full">
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto space-y-4">
                    <GitBranch size={48} className="text-primary mx-auto" />
                    <h3 className="text-lg font-semibold">Template Version Control</h3>
                    <p className="text-muted-foreground text-sm">
                      Manage template versions, track changes, and resolve conflicts
                    </p>
                    <Button onClick={() => setShowVersionControl(true)}>
                      <GitBranch size={14} className="mr-1" />
                      Open Version Control
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Share Template Dialog */}
        {showShareDialog && (
          <ShareTemplateDialog
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            onShare={handleShareTemplate}
            teamMembers={teamMembers}
            selectedTemplate={selectedTemplate}
          />
        )}

        {/* Version Control Dialog */}
        {showVersionControl && (
          <TemplateVersionControl
            isOpen={showVersionControl}
            onClose={() => {
              setShowVersionControl(false)
              setSelectedTemplateId(null)
            }}
            templateId={selectedTemplateId || undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface SharedTemplateCardProps {
  sharedTemplate: SharedTemplate
  index: number
  currentUser: TeamMember
  onRate: (templateId: string, rating: number, comment?: string) => void
  showOwnerActions?: boolean
}

function SharedTemplateCard({ sharedTemplate, index, currentUser, onRate, showOwnerActions }: SharedTemplateCardProps) {
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')

  const userHasRated = sharedTemplate.ratings.some(r => r.userId === currentUser.id)
  const Icon = sharedTemplate.template.icon

  const handleSubmitRating = () => {
    if (userRating > 0) {
      onRate(sharedTemplate.id, userRating, ratingComment)
      setShowRatingDialog(false)
      setUserRating(0)
      setRatingComment('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${sharedTemplate.template.color}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{sharedTemplate.template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {sharedTemplate.template.description}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-1">
                  {sharedTemplate.visibility === 'public' ? (
                    <Globe size={14} className="text-muted-foreground" />
                  ) : sharedTemplate.visibility === 'team' ? (
                    <Users size={14} className="text-muted-foreground" />
                  ) : (
                    <Lock size={14} className="text-muted-foreground" />
                  )}
                  
                  <Badge variant="outline" className="text-xs">
                    {sharedTemplate.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={sharedTemplate.sharedBy.avatar} />
              <AvatarFallback className="text-xs">
                {sharedTemplate.sharedBy.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Shared by {sharedTemplate.sharedBy.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {sharedTemplate.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag.toUpperCase()}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>★ {sharedTemplate.averageRating.toFixed(1)} ({sharedTemplate.ratings.length})</span>
              <span>Used {sharedTemplate.usageCount} times</span>
            </div>
            <span>{new Date(sharedTemplate.sharedAt).toLocaleDateString()}</span>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Download size={14} className="mr-1" />
              Use Template
            </Button>
            
            {!userHasRated && !showOwnerActions && (
              <Button variant="outline" size="sm" onClick={() => setShowRatingDialog(true)}>
                ★ Rate
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Copy size={14} />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedTemplateId(sharedTemplate.template.id)
                setShowVersionControl(true)
              }}
            >
              <GitBranch size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Template</DialogTitle>
            <DialogDescription>
              Help others by rating this template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className={`text-2xl ${star <= userRating ? 'text-yellow-500' : 'text-muted-foreground'} hover:text-yellow-500 transition-colors`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comment (optional)</Label>
              <Textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your thoughts about this template..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRating} disabled={userRating === 0}>
                Submit Rating
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

interface ShareRequestCardProps {
  request: ShareRequest
  index: number
  onAccept: () => void
  onDecline: () => void
}

function ShareRequestCard({ request, index, onAccept, onDecline }: ShareRequestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.fromUser.avatar} />
              <AvatarFallback>{request.fromUser.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{request.fromUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    wants to share a template with you
                  </p>
                  {request.message && (
                    <p className="text-sm mt-1 p-2 bg-muted/50 rounded">
                      "{request.message}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={onAccept}>
                    <UserCheck size={14} className="mr-1" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" onClick={onDecline}>
                    <UserX size={14} className="mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface TeamMemberCardProps {
  member: TeamMember
  index: number
  isCurrentUser: boolean
}

function TeamMemberCard({ member, index, isCurrentUser }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {member.isOnline && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {member.name}
                    {isCurrentUser && <Badge variant="secondary" className="text-xs">You</Badge>}
                    {member.role === 'owner' && <Crown size={14} className="text-yellow-500" />}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {member.isOnline ? 'Online' : `Last seen ${new Date(member.lastActive).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface ShareTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onShare: (template: AnalysisTemplate, shareData: any) => void
  teamMembers: TeamMember[]
  selectedTemplate: AnalysisTemplate | null
}

function ShareTemplateDialog({ isOpen, onClose, onShare, teamMembers }: ShareTemplateDialogProps) {
  const [customTemplates] = useKV<AnalysisTemplate[]>('custom-templates', [])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [visibility, setVisibility] = useState<'team' | 'public' | 'private'>('team')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('business')

  const handleShare = () => {
    const template = customTemplates.find(t => t.id === selectedTemplateId)
    if (!template) {
      toast.error('Please select a template to share')
      return
    }

    onShare(template, {
      visibility,
      selectedMembers: visibility === 'private' ? selectedMembers : undefined,
      message,
      category
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Template</DialogTitle>
          <DialogDescription>
            Share your analysis template with team members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template to share" />
              </SelectTrigger>
              <SelectContent>
                {customTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(value: 'team' | 'public' | 'private') => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    Team - All team members
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe size={14} />
                    Public - Anyone can access
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock size={14} />
                    Private - Selected members only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visibility === 'private' && (
            <div className="space-y-2">
              <Label>Select Members</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                {teamMembers.map(member => (
                  <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers(prev => [...prev, member.id])
                        } else {
                          setSelectedMembers(prev => prev.filter(id => id !== member.id))
                        }
                      }}
                    />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message about this template..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleShare}>
              <Send size={14} className="mr-1" />
              Share Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}