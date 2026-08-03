import Link from 'next/link'
import React from 'react'

export type Crumb = { href?: string; label: string }

/**
 * Ruta del artículo: Wiki / Dinos / Rex alfa.
 * El último elemento es la página actual y no lleva link.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="font-hud flex flex-wrap items-center gap-x-2 text-[11px] tracking-[0.18em] text-bone-dim uppercase">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li className="flex items-center gap-x-2" key={`${item.label}-${i}`}>
              {item.href && !last ? (
                <Link className="text-element hover:underline" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
