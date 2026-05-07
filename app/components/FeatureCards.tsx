'use client'

import { Tv, Zap, Hd, Shield, Clock, Globe } from 'lucide-react'

interface FeatureBadgeProps {
  icon: React.ReactNode
  label: string
  gradient: string
}

function FeatureBadge({ icon, label, gradient }: FeatureBadgeProps) {
  return (
    <div className="group flex flex-col items-center gap-1.5 min-w-17.5 sm:min-w-20">
      {/* Icon container */}
      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${gradient} shadow-md transition-transform duration-200 group-hover:scale-110 sm:h-12 sm:w-12`}>
        <div className="relative z-10 text-white">
          {icon}
        </div>
      </div>
      {/* Label */}
      <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

const features = [
  {
    icon: <Tv className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'Free',
    gradient: 'from-red-500 to-red-600',
  },
  {
    icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'Less Ads',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'No Buffer',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <Hd className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'HD',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'Live',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: <Globe className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'All Leagues',
    gradient: 'from-cyan-500 to-cyan-600',
  },
]

export function FeatureCards() {
  return (
    <div className="mb-6">
      {/* Horizontal scrollable feature badges */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {features.map((feature) => (
          <FeatureBadge
            key={feature.label}
            icon={feature.icon}
            label={feature.label}
            gradient={feature.gradient}
          />
        ))}
      </div>
    </div>
  )
}
