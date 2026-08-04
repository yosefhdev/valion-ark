import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'
import { formatSlug } from '../hooks/formatSlug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Categoría',
    plural: 'Categorías',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tier', 'order', 'updatedAt'],
    group: 'Contenido',
    description: 'Las secciones de la wiki: mods, dinos, guías, reglas.',
  },
  access: {
    read: publicRead,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nombre',
      admin: {
        description: 'Ej: Mods, Dinos, Guías, Configuración del servidor.',
      },
    },
    {
      name: 'description',
      type: 'text',
      label: 'Descripción',
      maxLength: 160,
      admin: {
        description: 'Una línea. Se muestra en la tarjeta del índice de la wiki.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen',
      admin: {
        description:
          'La miniatura de la tarjeta en el índice de la wiki. Sin ella la tarjeta sigue funcionando, solo queda como texto.',
      },
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      label: 'Nivel',
      defaultValue: 'basico',
      options: [
        { label: 'Básico', value: 'basico' },
        { label: 'Intermedio', value: 'intermedio' },
        { label: 'Avanzado', value: 'avanzado' },
        { label: 'Obligatorio', value: 'obligatorio' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Controla la franja de color de la tarjeta.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      label: 'Orden',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Menor va primero en el índice. Si empatan, se ordenan por nombre.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: 'Slug (URL)',
      admin: {
        position: 'sidebar',
        description: 'Se genera solo desde el nombre. Cámbialo solo si lo necesitas.',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
  ],
}
