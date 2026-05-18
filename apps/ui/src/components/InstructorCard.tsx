interface Props {
  name: string
  avatarUrl?: string | null
  label?: string
}

export function InstructorCard({ name, avatarUrl, label = 'Instrutor' }: Props) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div>
        <p className="text-xs text-blue-200">{label}</p>
        <p className="text-sm font-medium text-white">{name}</p>
      </div>
    </div>
  )
}
