import { createContext, useContext, useState, useCallback } from 'react'
import { useKV } from '@/lib/mock-spark'

export interface DocumentItem {
  id: string
  name: string
  size: number
  type: string
  status: string
  uploadedAt: Date | string
  progress?: number
}

interface DocumentContextValue {
  documents: DocumentItem[]
  addDocuments: (files: File[]) => Promise<void>
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void
  clearDocuments: () => void
}

const DocumentContext = createContext<DocumentContextValue | undefined>(undefined)

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useKV<DocumentItem[]>('documents', [])
  const [processing, setProcessing] = useState(false)

  const addDocuments = useCallback(async (files: File[]) => {
    if (!files.length) return
    const newDocs: DocumentItem[] = files.map(file => ({
      id: Math.random().toString(36).slice(2),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'processing',
      uploadedAt: new Date(),
      progress: 0
    }))
    setDocuments(prev => [...prev, ...newDocs])
    setProcessing(true)

    for (const doc of newDocs) {
      for (let p = 0; p <= 100; p += 20) {
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, progress: p } : d))
        await new Promise(r => setTimeout(r, 180))
      }
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'completed', progress: 100 } : d))
    }
    setProcessing(false)
  }, [setDocuments])

  const updateDocument = useCallback((id: string, patch: Partial<DocumentItem>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))
  }, [setDocuments])

  const clearDocuments = useCallback(() => {
    setDocuments([])
  }, [setDocuments])

  return (
    <DocumentContext.Provider value={{ documents, addDocuments, updateDocument, clearDocuments }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const ctx = useContext(DocumentContext)
  if (!ctx) throw new Error('useDocuments must be used within DocumentProvider')
  return ctx
}
