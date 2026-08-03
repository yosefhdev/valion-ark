import { slugify } from '@/hooks/formatSlug'

/**
 * Extrae los títulos del contenido Lexical para armar la tabla de contenidos.
 * El id tiene que salir de la misma función que usa el converter de RichText,
 * o el ancla apuntaría a un elemento que no existe.
 */

export type Heading = { id: string; level: number; text: string }

/** El id de un ancla. Compartido con el converter de headings. */
export function headingId(text: string): string {
  return slugify(text) || 'seccion'
}

type LexicalNode = {
  children?: LexicalNode[]
  tag?: string
  text?: string
  type?: string
}

/** Texto plano de un nodo, juntando todos sus hijos. */
function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  if (!node.children) return ''
  return node.children.map(nodeText).join('')
}

export function extractHeadings(data: unknown, levels = [2, 3]): Heading[] {
  const root = (data as { root?: LexicalNode } | null)?.root
  if (!root?.children) return []

  const out: Heading[] = []

  for (const node of root.children) {
    if (node.type !== 'heading' || !node.tag) continue

    const level = Number(node.tag.replace('h', ''))
    if (!levels.includes(level)) continue

    const text = nodeText(node).trim()
    if (!text) continue

    out.push({ id: headingId(text), level, text })
  }

  return out
}
