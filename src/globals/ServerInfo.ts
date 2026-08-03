import type { GlobalConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/**
 * Un solo registro con todo lo del landing que cambia sin tocar código:
 * la IP, el Discord, los rates. Es un global, no una colección, porque
 * nunca hay más de uno.
 */
export const ServerInfo: GlobalConfig = {
  slug: 'server-info',
  label: 'Datos del servidor',
  admin: {
    group: 'Configuración',
    description: 'Lo que aparece en la portada: IP, Discord y rates.',
  },
  access: {
    // Son datos públicos: es justo lo que el landing enseña a cualquiera.
    read: publicRead,
    update: authenticated,
  },
  fields: [
    {
      name: 'serverName',
      type: 'text',
      required: true,
      label: 'Nombre del servidor',
      defaultValue: 'Isla Perdida',
      admin: {
        description: 'Se usa en el logo y en el título de la pestaña del navegador.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      required: true,
      label: 'Titular',
      admin: {
        description: 'La frase grande de la portada. Corta y directa.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Descripción',
      maxLength: 300,
      admin: {
        description: 'El párrafo que va debajo del titular.',
      },
    },
    {
      name: 'ip',
      type: 'text',
      required: true,
      label: 'IP del servidor',
      admin: {
        description: 'Lo que el jugador copia para conectarse, ej: 192.0.2.10:7777',
      },
    },
    {
      name: 'discordUrl',
      type: 'text',
      required: true,
      label: 'Link del Discord',
      admin: {
        description: 'La invitación completa, empezando por https://',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mapCount',
          type: 'number',
          required: true,
          label: 'Mapas',
          defaultValue: 0,
          min: 0,
          admin: {
            width: '50%',
            description: 'Cuántos mapas tiene el cluster.',
          },
        },
        {
          name: 'modCount',
          type: 'number',
          required: true,
          label: 'Mods',
          defaultValue: 0,
          min: 0,
          admin: {
            width: '50%',
            description: 'Cuántos mods están activos.',
          },
        },
      ],
    },
    {
      name: 'rates',
      type: 'array',
      label: 'Rates',
      labels: { singular: 'Rate', plural: 'Rates' },
      admin: {
        description: 'La tira de multiplicadores de la portada. El orden aquí es el orden en pantalla.',
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Nombre',
              admin: { width: '50%', description: 'Ej: Recolección' },
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Valor',
              admin: { width: '50%', description: 'Ej: x5' },
            },
          ],
        },
      ],
    },
  ],
}
