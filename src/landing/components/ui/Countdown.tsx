'use client'

import { useEffect, useState } from 'react'

interface Diff {
  days: number
  hours: number
  minutes: number
}

function diffParts(end: Date): Diff {
  let diff = Math.max(0, end.getTime() - Date.now())
  const days = Math.floor(diff / 86400000)
  diff -= days * 86400000
  const hours = Math.floor(diff / 3600000)
  diff -= hours * 3600000
  const minutes = Math.floor(diff / 60000)
  return { days, hours, minutes }
}

export function Countdown({
  to,
  className,
}: {
  to?: string | null
  className?: string
}) {
  const [label, setLabel] = useState('—')

  useEffect(() => {
    if (!to) {
      setLabel('—')
      return
    }
    const tick = () => {
      const end = new Date(to)
      if (Number.isNaN(end.getTime())) {
        setLabel('—')
        return
      }
      const { days, hours, minutes } = diffParts(end)
      if (days > 0) setLabel(`${days}d ${hours}h`)
      else if (hours > 0) setLabel(`${hours}h ${minutes}m`)
      else setLabel(`${minutes}m left`)
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [to])

  return <span className={className}>{label}</span>
}
