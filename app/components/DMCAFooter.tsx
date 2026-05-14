import { Shield, Ban, ExternalLink, CheckCircle2, AlertTriangle, Mail, Scale } from 'lucide-react'

interface DMCAFooterProps {
  className?: string
}

export function DMCAFooter({ className = '' }: DMCAFooterProps) {
  return (
    <footer className={`rounded-2xl border border-zinc-200 bg-linear-to-br from-zinc-50 to-zinc-100 p-6 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800 ${className}`}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Legal & DMCA Notice</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
            <Ban className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-300">We DO NOT host any content</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">KdotTV does not store, host, or upload any media files. All contents are served by third-party providers. We are an information aggregator and search engine for publicly available content.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-300">NO fraudulent streaming services</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">We do not provide, endorse, or facilitate any illegal, pirated, or fraudulent streaming services. All indexed content is from legitimate, publicly accessible sources.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
            <ExternalLink className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-300">Third-party aggregation only</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Our platform indexes publicly available links from external services like Bet365, Dailymotion, and similar platforms. We have no control over third-party content.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/20">
            <Scale className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-300">Fair use & indexing principles</p>
              <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">We operate under principles of fair use and lawful indexing of publicly available information, similar to search engines and news aggregators.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-300">DMCA compliance</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">We respect copyright laws and will promptly remove infringing links upon valid DMCA takedown requests. We respond to all legitimate copyright concerns.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-700">
            <Mail className="h-5 w-5 shrink-0 text-zinc-600 dark:text-zinc-400 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-300">Copyright infringement contact</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-400 mt-1">For DMCA takedown requests, please contact us with detailed information including the specific URL and proof of copyright ownership. We will process valid requests within 24-48 hours.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            Copyright holders: Contact the third-party hosting providers directly for immediate content removal.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            This footer serves as our official DMCA policy and copyright compliance statement.
          </p>
        </div>
      </div>
    </footer>
  )
}
