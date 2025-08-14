/**
 * Arabic Voice Command Component for Phase 2
 * Floating voice input with Arabic medical terminology recognition
 */

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Mic, MicOff, Volume2, Play, Pause, RefreshCw } from 'lucide-react'
import { HealthcareAIService } from '@/lib/healthcare-ai'
import { VoiceCommand, VoiceIntent } from '@/types/healthcare'
import { toast } from 'sonner'

interface ArabicVoiceCommandProps {
  onCommand?: (command: VoiceCommand) => void
  onTranscriptChange?: (transcript: string) => void
  className?: string
  position?: 'floating' | 'inline'
  disabled?: boolean
}

interface VoiceRecognitionState {
  isListening: boolean
  isProcessing: boolean
  transcript: string
  confidence: number
  language: 'ar' | 'en' | 'auto'
  error?: string
}

export function ArabicVoiceCommand({
  onCommand,
  onTranscriptChange,
  className = '',
  position = 'floating',
  disabled = false
}: ArabicVoiceCommandProps) {
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    language: 'auto'
  })
  
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const healthcareAI = HealthcareAIService.getInstance()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      const recognition = recognitionRef.current
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ar-SA' // Saudi Arabic
      
      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, error: undefined }))
      }
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
            setVoiceState(prev => ({ 
              ...prev, 
              transcript: finalTranscript,
              confidence: confidence || 0.8
            }))
            
            // Process the final transcript
            processVoiceCommand(finalTranscript)
          } else {
            interimTranscript += transcript
            setVoiceState(prev => ({ 
              ...prev, 
              transcript: interimTranscript,
              confidence: 0.5
            }))
          }
        }
        
        onTranscriptChange?.(finalTranscript || interimTranscript)
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setVoiceState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: getErrorMessage(event.error)
        }))
        toast.error(`خطأ في التعرف على الصوت: ${getErrorMessage(event.error)}`)
      }
      
      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }))
      }
    } else {
      setVoiceState(prev => ({ 
        ...prev, 
        error: 'Speech recognition not supported in this browser'
      }))
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const processVoiceCommand = async (transcript: string) => {
    if (!transcript.trim()) return
    
    setVoiceState(prev => ({ ...prev, isProcessing: true }))
    
    try {
      // Process with healthcare AI
      const command = await healthcareAI.processVoiceCommand(transcript, {
        context: 'healthcare_workflow',
        language: voiceState.language
      })
      
      // Add to recent commands
      setRecentCommands(prev => [command, ...prev.slice(0, 4)])
      
      // Execute command callback
      onCommand?.(command)
      
      // Show success feedback
      toast.success(`تم تنفيذ الأمر: ${command.arabicCommand}`)
      
    } catch (error) {
      console.error('Voice command processing failed:', error)
      toast.error('فشل في معالجة الأمر الصوتي')
    } finally {
      setVoiceState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !voiceState.isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop()
    }
  }

  const toggleListening = () => {
    if (voiceState.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const clearTranscript = () => {
    setVoiceState(prev => ({ ...prev, transcript: '', confidence: 0 }))
  }

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'no-speech': 'لم يتم اكتشاف كلام',
      'audio-capture': 'فشل في التقاط الصوت',
      'not-allowed': 'لم يتم السماح بالوصول للميكروفون',
      'network': 'خطأ في الشبكة',
      'aborted': 'تم إلغاء العملية',
      'bad-grammar': 'خطأ في القواعد النحوية'
    }
    return errorMessages[error] || error
  }

  const getIntentIcon = (intent: VoiceIntent) => {
    const icons = {
      'upload_document': '📄',
      'analyze_document': '🔍',
      'translate_document': '🌐',
      'create_prescription': '💊',
      'schedule_appointment': '📅',
      'search_patient': '👤',
      'generate_report': '📊',
      'voice_note': '🎤'
    }
    return icons[intent] || '❓'
  }

  const FloatingButton = () => (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Button
        size="lg"
        className={`rounded-full w-16 h-16 shadow-lg transition-all duration-300 ${
          voiceState.isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        } ${voiceState.isProcessing ? 'animate-spin' : ''}`}
        onClick={toggleListening}
        disabled={disabled || voiceState.isProcessing}
      >
        {voiceState.isProcessing ? (
          <RefreshCw className="h-6 w-6" />
        ) : voiceState.isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      {(voiceState.transcript || voiceState.error) && (
        <div className="absolute bottom-20 right-0 w-80">
          <Card className="bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              {voiceState.error ? (
                <p className="text-red-500 text-sm">{voiceState.error}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">النص المسجل:</p>
                  <p className="text-sm">{voiceState.transcript}</p>
                  {voiceState.confidence > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      الثقة: {Math.round(voiceState.confidence * 100)}%
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  const InlineComponent = () => (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>الأوامر الصوتية الطبية</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'تصغير' : 'توسيع'}
          </Button>
        </CardTitle>
        <CardDescription>
          استخدم الأوامر الصوتية باللغة العربية لإدارة الوثائق الطبية
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voice Control */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <Button
            variant={voiceState.isListening ? "destructive" : "default"}
            onClick={toggleListening}
            disabled={disabled || voiceState.isProcessing}
            className="flex items-center space-x-2 space-x-reverse"
          >
            {voiceState.isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : voiceState.isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span>
              {voiceState.isProcessing 
                ? 'جارٍ المعالجة...' 
                : voiceState.isListening 
                  ? 'إيقاف التسجيل' 
                  : 'بدء التسجيل'
              }
            </span>
          </Button>
          
          {voiceState.transcript && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearTranscript}
            >
              مسح
            </Button>
          )}
        </div>

        {/* Transcript Display */}
        {(voiceState.transcript || voiceState.error) && (
          <div className="p-3 bg-muted rounded-lg">
            {voiceState.error ? (
              <p className="text-red-500 text-sm">{voiceState.error}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">النص المسجل:</p>
                <p className="text-sm">{voiceState.transcript}</p>
                {voiceState.confidence > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    مستوى الثقة: {Math.round(voiceState.confidence * 100)}%
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Commands */}
        {isExpanded && recentCommands.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <p className="text-sm font-medium">الأوامر الأخيرة:</p>
            <div className="space-y-2">
              {recentCommands.map((command, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span>{getIntentIcon(command.intent)}</span>
                    <span>{command.arabicCommand}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(command.confidence * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Command Examples */}
        {isExpanded && (
          <div className="space-y-2">
            <Separator />
            <p className="text-sm font-medium">أمثلة على الأوامر:</p>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <p>• "ارفع وثيقة جديدة"</p>
              <p>• "حلل الوثيقة"</p>
              <p>• "ترجم إلى الإنجليزية"</p>
              <p>• "اكتب وصفة طبية"</p>
              <p>• "ابحث عن مريض"</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return position === 'floating' ? <FloatingButton /> : <InlineComponent />
}

export default ArabicVoiceCommand