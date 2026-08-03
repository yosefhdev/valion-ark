import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // las imágenes son públicas (para mostrarlas en el blog)
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  upload: {
    // Payload genera estos tamaños automáticamente al subir una imagen.
    // Útil para no servir siempre la imagen full-size en listados/cards.
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: undefined,
      },
      {
        name: 'og', // para compartir en redes / preview links
        width: 1200,
        height: 630,
        crop: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
}
