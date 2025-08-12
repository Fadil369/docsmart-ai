import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { Label } from '@/components/ui/label'
  name: string
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  color: string
import { motion } from 'framer-motion'
    actions: string
import { useKV } from '@github/spark/hooks'

    sentiment: boolean
    keyMetrics: boolean
  }
    sections: 
  }

const defau
    id: 'financ
    descript
    icon: Target,
    prompts: {
      insights: 'Ex
      recommendations: 'Pro
        'What are the main rev
   
      ]
    features: {
    sentiment: boolean
      keyMetrics: tru
    keyMetrics: boolean
      sections: ['Execu
  }
  {
    name: 'Legal Docum
    documentTypes: ['pdf', '
  }
 

      customQuestions: [
        'Are there any unusual or risky clause
   
    },
      translation: true,
      entities: true,
      compliance: true
    icon: Target,
      visualizations: ['time
    prompts: {
    id: 'research-paper',
    description: 'Academic and research document analysis with methodology focus',
    icon: Brain,
    prompts: {
      insights: 'Extract
      recommendations: 'Provide recommendatio
        'What is the main research hypothesis?',
        'What are the key findings and their signific
      ]
      ]
      
    features: {
    },
      sections: ['Resea
    }
  {
    name: 'Business Pr
    },
    color: 'text-or
      summary: 'Analyze this business proposal focusing on objectives, strategy, feasibility, and expected outcomes
      actions: 'Identify critical action items for pr
     
    
  {
    },
      translation: true,
      entities: true,
      compliance: false
    outputFormat: {
      visualizations: ['swo
  },
    id: 'data-spreadsheet',
    description: 'Comprehensive analysis for spreadsheets and data files',
    icon: Table,
    prompts: {
      customQuestions: [
      recommendations: 'Provide recommendations for dat
        'What are the main data patterns and trend
        'What correlations exist between variab
      ]
    fea
    },
      keyMetric
      translation: true,
      sections: ['Data 
      entities: true,
]
      compliance: true
  onTe
}
export function AnalysisTemplates({ documentType, onTemplateSelect, selectedTemplate }: AnalysisTemplatesProps) {
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  con
  },
   
    id: 'research-paper',
    onTemplateSelect(template)
    description: 'Academic and research document analysis with methodology focus',
  const handleCreateCustomTemplate 
    icon: Brain,
      description: '',
    prompts: {
      prompts: {
        insights: '',
        recommendations: '',
      },
        translation: fal
        'What is the main research hypothesis?',
        compliance: false
      outputFormat: {
        visualizations: []
      ]
    },
  const handleS
      // Update existing
        current.map(t =
    } else {
      const newTemplate
    }
    se
  }
  const handleDeleteTemplate = (templateId: string) => {
    toast.success('Template deleted')
    }
    
  {
          <p className="text
          </p>
        
          <DialogTrigger asChild>
              <Set
            </Button>
          <Dia
              <DialogTitle>
              </DialogTitle>
                Design a custom analysis template for your specific needs
            </DialogHeader>
            {editingTemp
                template={editingTemplate}
                onCancel={() => {
                  setEditingTemplate(null)
              />
       
    },
      <Tabs val
      translation: true,
        </TabsList>
      entities: true,
            {defaultTem
      compliance: false
      
    outputFormat: {
                  index={index}
              ))}
     
  },
   
    id: 'data-spreadsheet',
            >
    description: 'Comprehensive analysis for spreadsheets and data files',
                <p className="text-muted-f
    icon: Table,
                  Create Your 
    prompts: {
          ) : (
              {customTemplates.map((template, index) => (
                  key={template.id}
                  isSelected={selectedTemplate?.id === template.id}
                  onEdit
                    setShowCustomDialog(true)
                  onDelete={() => handleDeleteT
                  index={index}
              ))}
      ]
    },
  )

  template: AnalysisTem
  onSelect: () => void
  onDelete?: () => void
  index: number

  const Icon = temp
  return (
      initial={{ opacity: 0, y: 20 }}
    }
   
]

              <div className={`p-2
              </div>
                <CardTitle className="text-base">{templa
                  {template.documentT
}

export function AnalysisTemplates({ documentType, onTemplateSelect, selectedTemplate }: AnalysisTemplatesProps) {
                  <Settings size={14} />
  const [showCustomDialog, setShowCustomDialog] = useState(false)
                </Button>
            )}

        <CardContent onClick={onSelect}>
            {template.description}

   

                  {feature}
    onTemplateSelect(template)

  }

    </motion.div>
}
      id: '',
  onSave: (temp
      description: '',
function CustomTemplateEditor({ temp

    if (!template.name || !te
      prompts: {
    onSave(template)
        insights: '',
    <div className="
        recommendations: '',
          <Input
      },
            place
        </div>
        <div className="s
        entities: false,
            onValueChange=
        compliance: false
        
      outputFormat: {
              <Select
        visualizations: []
       
    })

  }

          onChange={(e) => setTemplate(prev => ({ ...prev, descripti
          rows={2}
      // Update existing
      <div className="space-y-4">
        
       
    } else {
              value
                ...prev,
              }))}
    }
          </div>
          <div className="sp
            <Textarea
  }

  const handleDeleteTemplate = (templateId: string) => {
              rows={2}
    toast.success('Template deleted')
   

          
                ...prev,
              }))}
             
          </div>
          <div className="space-y-2">
            <Textarea
          </p>
              
        
              rows={2}
          <DialogTrigger asChild>
      </div>
      <div className="space-y-4">
        <div className="grid 
            </Button>
              <Switch
                onCheckedChange={(checked) =>
                    ...pre
              <DialogTitle>
              />
              </DialogTitle>
      </div>
                Design a custom analysis template for your specific needs
          Cancel
            </DialogHeader>
        </Bu
    </div>
}
                template={editingTemplate}

                onCancel={() => {

                  setEditingTemplate(null)

              />









        </TabsList>











                  index={index}

              ))}









            >

                <div className="text-4xl">🎨</div>









          ) : (

              {customTemplates.map((template, index) => (

                  key={template.id}

                  isSelected={selectedTemplate?.id === template.id}



                    setShowCustomDialog(true)



                  index={index}

              ))}





  )





  onSelect: () => void

  onDelete?: () => void

  index: number





  return (

      initial={{ opacity: 0, y: 20 }}











              </div>









              <div className="flex gap-1">

                  <Settings size={14} />
                </Button>




            )}



        <CardContent onClick={onSelect}>

            {template.description}







                  {feature}

              ))}







    </motion.div>

}





}







      return

    onSave(template)







          <Input





        </div>
        




























          rows={2}

      </div>

      <div className="space-y-4">

        







                ...prev,

              }))}
              placeholder="Define how the AI should summarize this document type"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insights-prompt">Insights Prompt</Label>
            <Textarea
              id="insights-prompt"
              value={template.prompts.insights}
              onChange={(e) => setTemplate(prev => ({
                ...prev,
                prompts: { ...prev.prompts, insights: e.target.value }
              }))}
              placeholder="Define what insights the AI should extract"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actions-prompt">Actions Prompt</Label>
            <Textarea
              id="actions-prompt"
              value={template.prompts.actions}
              onChange={(e) => setTemplate(prev => ({
                ...prev,
                prompts: { ...prev.prompts, actions: e.target.value }
              }))}
              placeholder="Define what action items the AI should identify"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations-prompt">Recommendations Prompt</Label>
            <Textarea
              id="recommendations-prompt"
              value={template.prompts.recommendations}
              onChange={(e) => setTemplate(prev => ({
                ...prev,
                prompts: { ...prev.prompts, recommendations: e.target.value }
              }))}
              placeholder="Define what recommendations the AI should provide"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Analysis Features</Label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(template.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between">
              <Label className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</Label>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setTemplate(prev => ({
                    ...prev,
                    features: { ...prev.features, [feature]: checked }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Template
        </Button>
      </div>
    </div>
  )
}