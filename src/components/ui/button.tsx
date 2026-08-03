import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Base de los CTA. Adaptado de shadcn/ui: sin `rounded-*`, porque el diseño
 * usa esquinas rectas o recortadas, nunca radios.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-hud text-xs uppercase tracking-widest transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-torch text-obsidian hover:bg-torch/90',
        outline: 'border border-moss text-bone hover:border-element hover:text-element',
        ghost: 'text-bone-dim hover:text-element',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-5',
        lg: 'h-12 px-7 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
