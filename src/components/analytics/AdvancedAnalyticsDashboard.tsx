import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Download, Filter, TrendingUp, FileText, Users, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProcessingMetrics {
  date: string;
  documentsProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  compressionRatio: number;
  totalSize: number;
}

interface DocumentAnalytics {
  id: string;
  name: string;
  type: string;
  size: number;
  processedAt: string;
  processingTime: number;
  wordCount: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  language: string;
  readabilityScore: number;
  topics: string[];
  insights: string[];
}

interface UserActivity {
  userId: string;
  userName: string;
  documentsProcessed: number;
  averageRating: number;
  lastActive: string;
  preferredLanguage: string;
  activityScore: number;
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.teal,
  COLORS.danger,
  COLORS.secondary
];

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'processing' | 'engagement' | 'performance'>('processing');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real implementation, fetch from API
  const [metrics, setMetrics] = useState<ProcessingMetrics[]>([]);
  const [documentAnalytics, setDocumentAnalytics] = useState<DocumentAnalytics[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);

  useEffect(() => {
    // Simulate data loading
    const loadAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock metrics
      const mockMetrics: ProcessingMetrics[] = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        documentsProcessed: Math.floor(Math.random() * 100) + 20,
        averageProcessingTime: Math.floor(Math.random() * 5000) + 1000,
        successRate: Math.random() * 0.1 + 0.9,
        errorRate: Math.random() * 0.1,
        compressionRatio: Math.random() * 0.4 + 0.3,
        totalSize: Math.floor(Math.random() * 1000000) + 500000
      }));

      const mockDocuments: DocumentAnalytics[] = Array.from({ length: 150 }, (_, i) => ({
        id: `doc_${i}`,
        name: `Document_${i + 1}`,
        type: ['pdf', 'docx', 'xlsx', 'txt'][Math.floor(Math.random() * 4)],
        size: Math.floor(Math.random() * 10000000) + 100000,
        processedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        processingTime: Math.floor(Math.random() * 10000) + 500,
        wordCount: Math.floor(Math.random() * 5000) + 100,
        sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
        language: ['en', 'ar', 'es', 'fr'][Math.floor(Math.random() * 4)],
        readabilityScore: Math.floor(Math.random() * 100) + 1,
        topics: ['Technology', 'Business', 'Healthcare', 'Education', 'Finance'].slice(0, Math.floor(Math.random() * 3) + 1),
        insights: [`Insight ${i + 1}`, `Finding ${i + 1}`, `Recommendation ${i + 1}`]
      }));

      const mockUsers: UserActivity[] = Array.from({ length: 25 }, (_, i) => ({
        userId: `user_${i}`,
        userName: `User ${i + 1}`,
        documentsProcessed: Math.floor(Math.random() * 100) + 5,
        averageRating: Math.random() * 2 + 3,
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        preferredLanguage: ['en', 'ar', 'es', 'fr'][Math.floor(Math.random() * 4)],
        activityScore: Math.floor(Math.random() * 100) + 1
      }));

      setMetrics(mockMetrics);
      setDocumentAnalytics(mockDocuments);
      setUserActivity(mockUsers);
      setIsLoading(false);
    };

    loadAnalytics();
  }, [timeRange]);

  // Computed analytics
  const computedStats = useMemo(() => {
    const totalDocuments = documentAnalytics.length;
    const totalSize = documentAnalytics.reduce((sum, doc) => sum + doc.size, 0);
    const averageProcessingTime = documentAnalytics.reduce((sum, doc) => sum + doc.processingTime, 0) / totalDocuments;
    const averageReadability = documentAnalytics.reduce((sum, doc) => sum + doc.readabilityScore, 0) / totalDocuments;

    const sentimentDistribution = documentAnalytics.reduce((acc, doc) => {
      acc[doc.sentiment] = (acc[doc.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const languageDistribution = documentAnalytics.reduce((acc, doc) => {
      acc[doc.language] = (acc[doc.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeDistribution = documentAnalytics.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDocuments,
      totalSize,
      averageProcessingTime,
      averageReadability,
      sentimentDistribution,
      languageDistribution,
      typeDistribution
    };
  }, [documentAnalytics]);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const exportData = (format: 'csv' | 'json') => {
    const data = {
      metrics,
      documentAnalytics,
      userActivity,
      computedStats,
      exportedAt: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV
      const csvContent = Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}\n${value.map(item => Object.values(item).join(',')).join('\n')}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      }).join('\n\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into document processing and user activity
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button variant="outline" onClick={() => exportData('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{computedStats.totalDocuments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(computedStats.totalSize)} total size
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(computedStats.averageProcessingTime)}</div>
              <p className="text-xs text-muted-foreground">
                Per document
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Readability Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{computedStats.averageReadability.toFixed(1)}</div>
              <Progress value={computedStats.averageReadability} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userActivity.length}</div>
              <p className="text-xs text-muted-foreground">
                {userActivity.filter(u => new Date(u.lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} active today
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics */}
      <Tabs value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="processing">Document Processing</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="processing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Documents Processed Over Time</CardTitle>
                <CardDescription>Daily document processing volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="documentsProcessed" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Document Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
                <CardDescription>Distribution by file format</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(computedStats.typeDistribution).map(([type, count]) => ({
                        name: type.toUpperCase(),
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(computedStats.typeDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Document sentiment distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(computedStats.sentimentDistribution).map(([sentiment, count]) => ({
                    sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
                    count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sentiment" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.success} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Documents by detected language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(computedStats.languageDistribution).map(([lang, count]) => {
                    const percentage = (count / computedStats.totalDocuments) * 100;
                    return (
                      <div key={lang} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{lang.toUpperCase()}</Badge>
                          <span className="text-sm">{count} documents</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Top active users by document processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity
                    .sort((a, b) => b.documentsProcessed - a.documentsProcessed)
                    .slice(0, 10)
                    .map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{user.userName}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.documentsProcessed} documents
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{user.preferredLanguage.toUpperCase()}</Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium">{user.averageRating.toFixed(1)}★</p>
                            <p className="text-xs text-muted-foreground">rating</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Success Rate</CardTitle>
                <CardDescription>Success rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0.8, 1]} />
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                    <Line 
                      type="monotone" 
                      dataKey="successRate" 
                      stroke={COLORS.success} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Time vs File Size */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Time vs File Size</CardTitle>
                <CardDescription>Correlation between file size and processing time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={documentAnalytics.slice(0, 50)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="size" name="File Size (bytes)" />
                    <YAxis dataKey="processingTime" name="Processing Time (ms)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="processingTime" fill={COLORS.primary} />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compression Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Compression Efficiency</CardTitle>
                <CardDescription>Compression ratio trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                    <Area 
                      type="monotone" 
                      dataKey="compressionRatio" 
                      stroke={COLORS.purple} 
                      fill={COLORS.purple}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Multi-dimensional performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    {
                      metric: 'Speed',
                      value: 85,
                      fullMark: 100,
                    },
                    {
                      metric: 'Accuracy',
                      value: 92,
                      fullMark: 100,
                    },
                    {
                      metric: 'Compression',
                      value: 78,
                      fullMark: 100,
                    },
                    {
                      metric: 'User Satisfaction',
                      value: 88,
                      fullMark: 100,
                    },
                    {
                      metric: 'Reliability',
                      value: 95,
                      fullMark: 100,
                    },
                    {
                      metric: 'Scalability',
                      value: 82,
                      fullMark: 100,
                    },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Rate Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Error Rate Trends</CardTitle>
                <CardDescription>Processing errors over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                    <Line 
                      type="monotone" 
                      dataKey="errorRate" 
                      stroke={COLORS.danger} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
