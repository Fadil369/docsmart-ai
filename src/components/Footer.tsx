import { Heart } from '@/lib/safe-icons'

export function Footer() {
  return (
    <footer className="mt-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-6 border-t border-border bg-card/50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart size={14} className="text-red-500" weight="fill" />
            <span>by</span>
            <span className="font-semibold text-foreground">Dr. Mohamed El Fadil</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-xs text-muted-foreground text-center">
            <span>© 2024 BRAINSAITبرينسايت</span>
            <span className="hidden sm:inline">•</span>
            <span>AI-Powered Document Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  )
}