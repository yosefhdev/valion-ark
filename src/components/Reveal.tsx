'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Aparición al entrar en el viewport.
 *
 * El estado oculto NO vive aquí sino en `.reveal` de globals.css, dentro de
 * `@media (prefers-reduced-motion: no-preference)`. Así, quien pide menos
 * movimiento no recibe `opacity: 0` — y no se queda con la página en blanco,
 * que es lo que pasa si se oculta con estilos inline y luego se anulan las
 * transiciones.
 */
export function Reveal({
  as: Tag = 'div',
  children,
  className,
  delay = 0,
}: {
  as?: React.ElementType
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Navegador sin soporte: mostrar todo. Se difiere un frame porque llamar
    // a setState en el cuerpo del efecto encadena renders (react-hooks).
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          setShown(true)
          observer.disconnect() // una sola vez: no se re-oculta al subir
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // El escalonado se corta a 240 ms: sin tope, una lista de 8 elementos deja
  // al último medio segundo esperando y la sección se siente lenta.
  const staggered = Math.min(Math.max(delay, 0), 240)

  return (
    <Tag
      className={cn('reveal', className)}
      data-shown={shown ? '' : undefined}
      ref={ref}
      style={staggered ? { transitionDelay: `${staggered}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
