import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  CheckCircle
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LandingPageProps {
  onGetStarted: () => void
}

type Language = 'en' | 'ar'

const translations = {
  en: {
    title: "Transform Documents with AI Intelligence",
    subtitle: "Upload, analyze, translate, and optimize your documents with cutting-edge AI technology. Experience the future of document processing.",
    tryDemo: "Try Demo",
    getStarted: "Get Started",
    features: {
      title: "Powerful Features for Modern Teams",
      subtitle: "Everything you need to handle documents intelligently"
    },
    feature1: {
      title: "AI-Powered Analysis",
      description: "Extract insights, summaries, and actionable items from any document using advanced AI"
    },
    feature2: {
      title: "Instant Translation",
      description: "Seamlessly translate between English and Arabic while preserving formatting"
    },
    feature3: {
      title: "Smart Compression",
      description: "Reduce file sizes by up to 70% without compromising quality"
    },
    feature4: {
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