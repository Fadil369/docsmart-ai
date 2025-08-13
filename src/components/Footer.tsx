import { Heart } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer className="mt-auto py-6 px-4 border-t border-border bg-card/50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart size={16} className="text-red-500" weight="fill" />
            <span>by</span>
            <span className="font-semibold text-foreground">Dr. Mohamed El Fadil</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>© 2024 BRAINSAITبرينسايت</span>
            <span>•</span>
            <span>AI-Powered Document Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  )
}