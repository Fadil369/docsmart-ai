import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  FileText, 
  Brain, 
  Translate, 
  ArrowsIn, 
  Shield, 
  Zap, 
  Globe,
  ChartLine,
  Users,
  Sparkle,
  ArrowRight,
  CheckCircle,
  Upload,
  Merge,
  Share2,
  Copy,
  Download,
  Languages
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LandingPageProps {
  onGetStarted: () => void
}

type Language = 'en' | 'ar'

const translations = {
  en: {
    title: "BRAINSAITبرينسايت",
    subtitle: "AI-Powered Document Intelligence Hub",
    description: "Transform your documents with cutting-edge AI technology. Upload, analyze, translate, compress, merge, and collaborate with powerful AI assistance.",
    tryDemo: "Try Demo",
    getStarted: "Get Started",
    poweredBy: "Powered by AI Copilot",
    features: {
      title: "Powerful AI Features",
      subtitle: "Everything you need for intelligent document processing"
    },
    capabilities: [
      "Upload any document type",
      "AI-powered analysis & insights", 
      "Instant AR ⇄ EN translation",
      "Smart compression (up to 70% reduction)",
      "Intelligent document merging",
      "Real-time collaboration",
      "Custom template creation",
      "Multi-format export",
      "Team sharing & workflow",
      "Advanced AI copilot integration"
    ]
  },
  ar: {
    title: "BRAINSAITبرينسايت",
    subtitle: "مركز الذكاء الاصطناعي للوثائق",
    description: "حوّل وثائقك بتقنية الذكاء الاصطناعي المتطورة. ارفع، حلل، ترجم، اضغط، ادمج، وتعاون مع مساعدة الذكاء الاصطناعي القوية.",
    tryDemo: "جرب العرض التوضيحي",
    getStarted: "ابدأ الآن",
    poweredBy: "مدعوم بمساعد الذكاء الاصطناعي",
    features: {
      title: "ميزات الذكاء الاصطناعي القوية",
      subtitle: "كل ما تحتاجه لمعالجة الوثائق الذكية"
    },
    capabilities: [
      "رفع أي نوع من الوثائق",
      "تحليل ورؤى مدعومة بالذكاء الاصطناعي",
      "ترجمة فورية عربي ⇄ انجليزي",
      "ضغط ذكي (تقليل حتى 70%)",
      "دمج ذكي للوثائق",
      "تعاون في الوقت الفعلي",
      "إنشاء قوالب مخصصة",
      "تصدير متعدد الصيغ",
      "مشاركة الفريق وسير العمل",
      "تكامل متقدم مع مساعد الذكاء الاصطناعي"
    ]
  }
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [language, setLanguage] = useState<Language>('en')
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  
  const t = translations[language]
  const isRTL = language === 'ar'

  const features = [
    { icon: Upload, color: "bg-blue-500", title: "Upload", description: "Any document type, any size" },
    { icon: Brain, color: "bg-purple-500", title: "AI Analysis", description: "Powered by Copilot API" },
    { icon: Translate, color: "bg-green-500", title: "Translate", description: "AR ⇄ EN instantly" },
    { icon: ArrowsIn, color: "bg-orange-500", title: "Compress", description: "Up to 70% reduction" },
    { icon: Merge, color: "bg-indigo-500", title: "Merge", description: "Intelligent consolidation" },
    { icon: Users, color: "bg-pink-500", title: "Collaborate", description: "Real-time teamwork" },
    { icon: FileText, color: "bg-yellow-500", title: "Templates", description: "Custom & reusable" },
    { icon: Share2, color: "bg-cyan-500", title: "Share", description: "Seamless distribution" },
    { icon: Copy, color: "bg-gray-500", title: "Duplicate", description: "Smart copying" },
    { icon: Download, color: "bg-emerald-500", title: "Export", description: "Multiple formats" }
  ]

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-accent/5", isRTL && "rtl")}>
      {/* Header with Language Toggle */}
      <header className="p-6">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Brain size={28} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.title}
            </span>
          </div>
          
          {/* Language Toggle */}
          <div className="flex items-center gap-3 p-3 bg-card rounded-xl border">
            <Languages size={20} className="text-muted-foreground" />
            <span className={cn("text-sm font-medium", language === 'en' ? "text-primary" : "text-muted-foreground")}>
              EN
            </span>
            <Switch
              checked={language === 'ar'}
              onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
              className="data-[state=checked]:bg-primary"
            />
            <span className={cn("text-sm font-medium", language === 'ar' ? "text-primary" : "text-muted-foreground")}>
              العربية
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 mb-16"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
            >
              <Sparkle size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">{t.poweredBy}</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t.subtitle}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={onGetStarted}
            >
              <Brain className="mr-2" size={20} />
              {t.tryDemo}
              <ArrowRight className="ml-2" size={20} />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={onGetStarted}
            >
              {t.getStarted}
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">{t.features.title}</h2>
            <p className="text-muted-foreground text-lg">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                >
                  <Card className={cn(
                    "p-4 cursor-pointer transition-all duration-300 h-full",
                    hoveredFeature === index && "shadow-lg border-primary/50"
                  )}>
                    <CardContent className="p-0 text-center space-y-3">
                      <div className={cn(
                        "w-12 h-12 mx-auto rounded-xl flex items-center justify-center",
                        feature.color
                      )}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Capabilities List */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Everything You Need</h3>
                <p className="text-muted-foreground">
                  Comprehensive AI-powered document processing with advanced capabilities
                </p>
              </div>
              
              <div className="grid gap-3">
                {t.capabilities.map((capability, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    <span className="text-sm">{capability}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-16 space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of document processing with AI-powered intelligence
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            onClick={onGetStarted}
          >
            <Zap className="mr-2" size={20} />
            Launch Workspace
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-border bg-card/50">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Created by</span>
            <span className="font-semibold text-foreground">Dr. Mohamed El Fadil</span>
            <span>•</span>
            <span>© 2024 BRAINSAITبرينسايت</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
      title: "Enterprise Security",
      description: "Bank-level encryption and privacy protection for your sensitive documents"
    },
    feature5: {
      title: "Lightning Fast",
      description: "Process documents in seconds with our optimized AI infrastructure"
    },
    feature6: {
      title: "Team Collaboration",
      description: "Share insights and collaborate on document analysis with your team"
    },
    benefits: {
      title: "Why Choose Document Intelligence Hub?",
      benefit1: "Save 80% of time on document processing",
      benefit2: "Increase accuracy with AI-powered insights",
      benefit3: "Support for 50+ document formats",
      benefit4: "99.9% uptime guarantee",
      benefit5: "24/7 expert support",
      benefit6: "GDPR & SOC2 compliant"
    },
    stats: {
      documents: "Documents Processed",
      languages: "Languages Supported", 
      compression: "Average Compression",
      accuracy: "AI Accuracy Rate"
    },
    cta: {
      title: "Ready to Transform Your Documents?",
      subtitle: "Join thousands of teams already using AI to process documents faster and smarter.",
      button: "Start Free Trial"
    }
  },
  ar: {
    title: "حوّل المستندات بذكاء الآلة",
    subtitle: "ارفع، حلل، ترجم، وحسّن مستنداتك باستخدام تقنية الذكاء الاصطناعي المتطورة. اختبر مستقبل معالجة المستندات.",
    tryDemo: "جرب النسخة التجريبية",
    getStarted: "ابدأ الآن",
    features: {
      title: "ميزات قوية للفرق العصرية",
      subtitle: "كل ما تحتاجه للتعامل مع المستندات بذكاء"
    },
    feature1: {
      title: "تحليل بالذكاء الاصطناعي",
      description: "استخرج الرؤى والملخصات والعناصر القابلة للتنفيذ من أي مستند باستخدام الذكاء الاصطناعي المتقدم"
    },
    feature2: {
      title: "ترجمة فورية",
      description: "ترجم بسلاسة بين الإنجليزية والعربية مع الحفاظ على التنسيق"
    },
    feature3: {
      title: "ضغط ذكي",
      description: "قلل أحجام الملفات بنسبة تصل إلى 70% دون المساس بالجودة"
    },
    feature4: {
      title: "أمان مؤسسي",
      description: "تشفير بمستوى البنوك وحماية الخصوصية لمستنداتك الحساسة"
    },
    feature5: {
      title: "سرعة البرق",
      description: "معالج المستندات في ثوانٍ مع بنيتنا التحتية المحسّنة للذكاء الاصطناعي"
    },
    feature6: {
      title: "تعاون الفريق",
      description: "شارك الرؤى وتعاون في تحليل المستندات مع فريقك"
    },
    benefits: {
      title: "لماذا تختار مركز ذكاء المستندات؟",
      benefit1: "توفير 80% من الوقت في معالجة المستندات",
      benefit2: "زيادة الدقة مع رؤى مدعومة بالذكاء الاصطناعي",
      benefit3: "دعم أكثر من 50 تنسيق مستند",
      benefit4: "ضمان وقت تشغيل 99.9%",
      benefit5: "دعم الخبراء على مدار الساعة",
      benefit6: "متوافق مع GDPR و SOC2"
    },
    stats: {
      documents: "المستندات المعالجة",
      languages: "اللغات المدعومة",
      compression: "متوسط الضغط",
      accuracy: "معدل دقة الذكاء الاصطناعي"
    },
    cta: {
      title: "هل أنت مستعد لتحويل مستنداتك؟",
      subtitle: "انضم إلى آلاف الفرق التي تستخدم بالفعل الذكاء الاصطناعي لمعالجة المستندات بشكل أسرع وأذكى.",
      button: "ابدأ تجربة مجانية"
    }
  }
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [language, setLanguage] = useState<Language>('en')
  const t = translations[language]
  const isRTL = language === 'ar'

  const features = [
    {
      icon: Brain,
      title: t.feature1.title,
      description: t.feature1.description,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Translate,
      title: t.feature2.title,
      description: t.feature2.description,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: ArrowsIn,
      title: t.feature3.title,
      description: t.feature3.description,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Shield,
      title: t.feature4.title,
      description: t.feature4.description,
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: Zap,
      title: t.feature5.title,
      description: t.feature5.description,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Users,
      title: t.feature6.title,
      description: t.feature6.description,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    }
  ]

  const benefits = [
    t.benefits.benefit1,
    t.benefits.benefit2,
    t.benefits.benefit3,
    t.benefits.benefit4,
    t.benefits.benefit5,
    t.benefits.benefit6
  ]

  const stats = [
    { value: "1M+", label: t.stats.documents },
    { value: "20+", label: t.stats.languages },
    { value: "70%", label: t.stats.compression },
    { value: "99.8%", label: t.stats.accuracy }
  ]

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-muted/30", isRTL && "rtl")}>
      {/* Language Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-50"
      >
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border rounded-full p-1">
          <Button
            size="sm"
            variant={language === 'en' ? 'default' : 'ghost'}
            onClick={() => setLanguage('en')}
            className="rounded-full h-8 px-3 text-xs"
          >
            EN
          </Button>
          <Button
            size="sm"
            variant={language === 'ar' ? 'default' : 'ghost'}
            onClick={() => setLanguage('ar')}
            className="rounded-full h-8 px-3 text-xs"
          >
            AR
          </Button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <Badge variant="outline" className="mx-auto px-4 py-1">
            <Sparkle size={14} className="mr-2" />
            AI-Powered Document Intelligence
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            {t.title}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="text-lg px-8 py-6 rounded-xl"
            >
              {t.tryDemo}
              <ArrowRight size={20} className={cn("ml-2", isRTL && "mr-2 ml-0 rotate-180")} />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl"
            >
              {t.getStarted}
            </Button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.features.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className={cn("w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center", feature.bgColor)}>
                    <feature.icon size={32} className={feature.color} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              {t.benefits.title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-4 bg-card rounded-xl"
              >
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t.cta.title}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t.cta.subtitle}
              </p>
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkle size={20} className="mr-2" />
                {t.cta.button}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}