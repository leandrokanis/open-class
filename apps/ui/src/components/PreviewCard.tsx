interface Props {
  thumbnailUrl?: string | null
  totalDurationSeconds: number
  variant?: 'desktop' | 'mobile'
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export function PreviewCard({ thumbnailUrl, totalDurationSeconds, variant = 'desktop' }: Props) {
  const label = variant === 'mobile' ? 'PRÉVIA DISPONÍVEL' : 'Assistir prévia gratuita'

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-blue-800 to-blue-950 flex flex-col items-center justify-center aspect-video min-h-[180px]">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt="Prévia do curso"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      )}

      <button
        type="button"
        aria-label="Assistir prévia"
        className="relative z-10 w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <span className="text-white text-xl ml-1">▶</span>
      </button>

      <p className="relative z-10 mt-3 text-white/80 text-sm tracking-wider">{label}</p>

      {totalDurationSeconds > 0 && (
        <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          {formatDuration(totalDurationSeconds)}
        </span>
      )}
    </div>
  )
}
