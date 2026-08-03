import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  HeadingFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
} from '@payloadcms/richtext-lexical'
import { authenticated, publishedOrAuthenticated } from '../access'
import { formatSlug } from '../hooks/formatSlug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Artículo',
    plural: 'Artículos',
  },
  admin: {
    useAsTitle: 'title',
    // Incluir _status es clave para ver de un vistazo qué está publicado.
    defaultColumns: ['title', 'category', '_status', 'updatedAt'],
    group: 'Contenido',
    description: 'Cada entrada de la wiki: mods, dinos, guías y reglas.',
    preview: (doc) => {
      if (!doc?.slug) return null
      return `/wiki/preview?slug=${doc.slug}`
    },
  },
  versions: {
    drafts: {
      autosave: { interval: 2000 }, // guarda mientras escribes, sin publicar
    },
    maxPerDoc: 20,
  },
  access: {
    read: publishedOrAuthenticated, // el público solo ve publicados
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'Slug (URL)',
      admin: {
        position: 'sidebar',
        description: 'Se genera solo desde el título. Cámbialo solo si lo necesitas.',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Categoría',
      admin: { position: 'sidebar' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Resumen',
      maxLength: 200,
      admin: {
        description: 'Aparece en las tarjetas de listado y al compartir el link.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada',
    },
    {
      // El editor de texto enriquecido: títulos, negritas, listas,
      // imágenes insertadas en el cuerpo, citas, links.
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Contenido',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      admin: {
        description: 'El h1 lo pone el sitio con el título. Empieza tus secciones en h2.',
      },
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Bloque de stats (dossier)',
      labels: { singular: 'Stat', plural: 'Stats' },
      admin: {
        description: 'Opcional. Solo para artículos de dinos: alimenta el panel lateral.',
        initCollapsed: true,
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Nombre' },
        { name: 'value', type: 'number', required: true, label: 'Valor' },
        {
          name: 'max',
          type: 'number',
          required: true,
          label: 'Máximo',
          admin: { description: 'Para calcular el largo de la barra.' },
        },
      ],
    },
  ],
}
