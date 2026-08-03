import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Chips de tier y de categoría. Sin radios, como el resto del sistema.
 */
const badgeVariants = cva(
  'inline-flex items-center font-hud text-[10px] uppercase tracking-[0.18em] px-2 py-1',
  {
    variants: {
      tier: {
        basico: 'bg-element/15 text-element',
        intermedio: 'bg-bone/10 text-bone',
        avanzado: 'bg-torch/15 text-torch',
        obligatorio: 'bg-rust/20 text-rust',
        neutral: 'bg-moss/40 text-bone-dim',
      },
    },
    defaultVariants: { tier: 'neutral' },
  },
)

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

export function Badge({ className, tier, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tier }), className)} {...props} />
}

export { badgeVariants }
