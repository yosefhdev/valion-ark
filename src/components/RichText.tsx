import Image from 'next/image'
import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { Media } from '@/payload-types'
import { headingId } from '@/lib/headings'
import { cn } from '@/lib/utils'

/**
 * Lexical -> JSX con las clases del diseño.
 *
 * Solo se sobreescriben los nodos que necesitan tratamiento propio. Listas,
 * tablas y texto en negrita se estilizan con CSS descendiente bajo
 * `.rich-text` en globals.css: reimplementar el converter de listas obligaría
 * a repetir la lógica de checklists sin ganar nada.
 */

/** Un link que sale del sitio se abre en pestaña nueva, marque o no el editor. */
function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/**
 * Texto plano de un nodo, para poder derivar el id del título. Recibe
 * `unknown` porque los tipos de nodo de Lexical no comparten forma entre sí.
 */
function plainText(node: unknown): string {
  const n = node as { children?: unknown[]; text?: unknown }
  if (typeof n?.text === 'string') return n.text
  if (!Array.isArray(n?.children)) return ''
  return n.children.map(plainText).join('')
}

const HEADING_CLASS: Record<string, string> = {
  h1: 'font-display text-4xl font-extrabold uppercase mt-12 mb-4',
  h2: 'font-display text-3xl font-extrabold uppercase mt-12 mb-4',
  h3: 'font-display text-2xl font-semibold uppercase mt-10 mb-3',
  h4: 'font-hud text-sm uppercase tracking-[0.18em] text-element mt-8 mb-2',
  h5: 'font-hud text-xs uppercase tracking-[0.18em] text-bone-dim mt-6 mb-2',
  h6: 'font-hud text-xs uppercase tracking-[0.18em] text-bone-dim mt-6 mb-2',
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag
    // El id lo genera la misma función que usa la tabla de contenidos, o los
    // enlaces del índice apuntarían a anclas inexistentes.
    const text = plainText(node)
    return (
      <Tag
        className={HEADING_CLASS[node.tag] ?? HEADING_CLASS.h2}
        id={text ? headingId(text) : undefined}
      >
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    )
  },

  quote: ({ node, nodesToJSX }) => (
    <blockquote className="my-8 border-l-2 border-torch pl-5 text-bone-dim italic">
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),

  horizontalrule: () => <hr className="my-10 border-moss" />,

  link: ({ node, nodesToJSX }) => {
    const href = node.fields.url ?? '#'
    const external = isExternal(href)
    return (
      <a
        className="text-element underline underline-offset-4"
        href={href}
        rel={external ? 'noopener noreferrer' : undefined}
        target={external || node.fields.newTab ? '_blank' : undefined}
      >
        {nodesToJSX({ nodes: node.children })}
      </a>
    )
  },

  upload: ({ node }) => {
    // Si el nodo llega sin poblar (depth 0) no hay nada que pintar. Es el
    // fallo silencioso clásico: sin esto la imagen simplemente no aparece.
    if (typeof node.value !== 'object' || node.value === null) return null

    const doc = node.value as Media
    if (!doc.mimeType?.startsWith('image')) {
      return (
        <a className="text-element underline" href={doc.url ?? '#'} rel="noopener noreferrer">
          {doc.filename}
        </a>
      )
    }

    // El tamaño `card`, no la original: puede pesar 1 MB.
    const size = doc.sizes?.card ?? doc
    if (!size.url || !size.width || !size.height) return null

    return (
      <figure className="my-8">
        <Image
          alt={doc.alt ?? ''}
          className="w-full border border-moss"
          height={size.height}
          src={size.url}
          width={size.width}
        />
        {doc.caption && (
          <figcaption className="font-hud mt-2 text-xs text-bone-dim">{doc.caption}</figcaption>
        )}
      </figure>
    )
  },
})

export function RichText({
  className,
  data,
}: {
  className?: string
  data: React.ComponentProps<typeof PayloadRichText>['data']
}) {
  // El contenedor lo pone este componente, no Payload: con `disableContainer`
  // el `className` de PayloadRichText no se aplica a nada y los estilos
  // descendientes de `.rich-text` no llegarían nunca a las listas ni tablas.
  return (
    <div className={cn('rich-text', className)}>
      <PayloadRichText converters={converters} data={data} disableContainer />
    </div>
  )
}
