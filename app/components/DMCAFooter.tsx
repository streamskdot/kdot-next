import { Shield } from 'lucide-react'

interface DMCAFooterProps {
  className?: string
}

export function DMCAFooter({ className = '' }: DMCAFooterProps) {
  return (
    <footer className={`rounded-2xl border border-zinc-200 bg-linear-to-br from-zinc-50 to-zinc-100 p-6 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="mb-2 font-bold text-zinc-900 dark:text-white">DMCA Notice</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            KdotTV does not store, host, or upload any media files directly on our platform. All content visible on our website is sourced from third-party websites and services through embedding technologies. Our platform simply aggregates and indexes links that are publicly available across the internet, including but not limited to embedded streams from platforms such as Bet365, Dailymotion, Streamable, and similar services. We respect all intellectual property rights and copyright laws. If you are a copyright holder and believe that any content linked or embedded on our site infringes upon your rights, please be aware that the actual media files are hosted on external servers beyond our control. We strongly encourage copyright owners to contact the respective third-party hosting providers where the content is physically stored. We are committed to complying with valid DMCA takedown requests and will promptly remove any infringing links from our platform upon verification.
          </p>
        </div>
      </div>
    </footer>
  )
}
