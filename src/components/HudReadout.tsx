'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Etiqueta mono + valor, con botón de copiar opcional. Es la caja de la IP
 * del héroe. Client component porque necesita el portapapeles y estado.
 */
export function HudReadout({
  className,
  copyable = false,
  label,
  value,
}: {
  className?: string
  copyable?: boolean
  label: string
  value: string
}) {
  const [copied, setCopied] = useState(false)

  // Devuelve el botón a su estado normal, y limpia el timer si el componente
  // se desmonta antes de que pasen los 2 segundos.
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Sin permiso de portapapeles (o sin HTTPS) no hay nada que hacer:
      // el valor sigue visible y se puede seleccionar a mano.
    }
  }

  return (
    <div className={cn('panel flex items-center justify-between gap-4 p-5', className)}>
      <div className="min-w-0">
        <p className="font-hud text-[11px] tracking-[0.22em] text-bone-dim uppercase">{label}</p>
        <p className="font-hud mt-1 truncate text-lg text-torch">{value}</p>
      </div>

      {copyable && (
        <button
          className="font-hud shrink-0 border border-moss px-3 py-2 text-[11px] tracking-widest uppercase transition-[color,border-color,transform] duration-150 ease-out hover:border-element hover:text-element active:scale-[0.97]"
          onClick={copy}
          type="button"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      )}

      {/* Anuncia el resultado a lectores de pantalla sin mover el layout. */}
      <span aria-live="polite" className="sr-only">
        {copied ? `${label} copiado al portapapeles` : ''}
      </span>
    </div>
  )
}
