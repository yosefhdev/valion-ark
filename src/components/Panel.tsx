import React from 'react'
import { cn } from '@/lib/utils'

/**
 * El elemento firma del diseño: caja con la esquina recortada.
 * La forma vive en la utilidad `.panel` de globals.css, no aquí, para que
 * el clip-path esté en un solo sitio.
 */
export function Panel({
  as: Tag = 'div',
  className,
  children,
  ...props
}: {
  as?: React.ElementType
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn('panel', className)} {...props}>
      {children}
    </Tag>
  )
}
