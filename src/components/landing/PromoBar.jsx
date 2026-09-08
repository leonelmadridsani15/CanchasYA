import { useEffect, useState } from 'react'

export default function PromoBar() {
  const [countdown, setCountdown] = useState('24:00:00')

  useEffect(() => {
    const deadline = Date.now() + 86400000
    const update = () => {
      const seconds = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const rest = seconds % 60
      setCountdown([hours, minutes, rest].map((v) => String(v).padStart(2, '0')).join(':'))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-[#071426] text-white">
      <div className="mx-auto flex h-10 max-w-[1280px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-lime-400">⚡</span>
          <span>Turnos Relámpago</span>
          <span className="hidden text-slate-400 sm:inline">con descuento</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden text-slate-400 sm:inline">Termina en</span>
          <span id="promo-countdown" className="rounded-md bg-white/10 px-2.5 py-1 font-mono font-bold text-lime-400">
            {countdown}
          </span>
        </div>
      </div>
    </div>
  )
}
