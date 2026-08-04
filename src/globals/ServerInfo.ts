import type { GlobalConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/**
 * Un solo registro con todo lo del landing que cambia sin tocar código:
 * la IP, el Discord, los rates, los pasos de conexión y las reglas.
 *
 * Las pestañas van SIN `name` a propósito: las que llevan nombre anidan sus
 * campos dentro de un objeto y romperían los datos ya guardados. Sin nombre,
 * solo agrupan visualmente en el panel.
 */
export const ServerInfo: GlobalConfig = {
  slug: 'server-info',
  label: 'Datos del servidor',
  admin: {
    group: 'Configuración',
    description: 'Todo lo que aparece en la portada.',
  },
  access: {
    // Son datos públicos: es justo lo que el landing enseña a cualquiera.
    read: publicRead,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ---------------------------------------------------------------
        {
          label: 'Identidad',
          description: 'El encabezado de la portada.',
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
              admin: { description: 'La frase grande de la portada. Corta y directa.' },
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
              label: 'Descripción',
              maxLength: 300,
              admin: { description: 'El párrafo que va debajo del titular.' },
            },
          ],
        },

        // ---------------------------------------------------------------
        {
          label: 'Conexión',
          description: 'Cómo entra un jugador nuevo.',
          fields: [
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
              admin: { description: 'La invitación completa, empezando por https://' },
            },
            {
              name: 'connectionSteps',
              type: 'array',
              label: 'Pasos para conectarse',
              labels: { singular: 'Paso', plural: 'Pasos' },
              maxRows: 6,
              admin: {
                description:
                  'Se numeran solos en el orden de esta lista. Si lo dejas vacío, la sección no aparece.',
                initCollapsed: true,
              },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Título' },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  label: 'Explicación',
                  maxLength: 240,
                },
              ],
            },
          ],
        },

        // ---------------------------------------------------------------
        {
          label: 'Telemetría',
          description: 'Los números que se muestran en la tira de datos.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  label: 'Estado',
                  defaultValue: 'online',
                  options: [
                    { label: 'En línea', value: 'online' },
                    { label: 'Mantenimiento', value: 'mantenimiento' },
                    { label: 'Caído', value: 'offline' },
                  ],
                  admin: { width: '50%', description: 'El indicador del héroe.' },
                },
                {
                  name: 'version',
                  type: 'text',
                  label: 'Versión',
                  admin: { width: '50%', description: 'Opcional. Ej: v358.11' },
                },
              ],
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
                  admin: { width: '33%', description: 'Cuántos mapas tiene el cluster.' },
                },
                {
                  name: 'modCount',
                  type: 'number',
                  required: true,
                  label: 'Mods',
                  defaultValue: 0,
                  min: 0,
                  admin: { width: '33%', description: 'Cuántos mods están activos.' },
                },
                {
                  name: 'slots',
                  type: 'number',
                  label: 'Slots',
                  min: 0,
                  admin: { width: '33%', description: 'Opcional. Jugadores simultáneos.' },
                },
              ],
            },
            {
              name: 'rates',
              type: 'array',
              label: 'Rates',
              labels: { singular: 'Rate', plural: 'Rates' },
              admin: {
                description:
                  'La tira de multiplicadores. El orden aquí es el orden en pantalla.',
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
        },

        // ---------------------------------------------------------------
        {
          label: 'Contenido',
          description: 'Bloques de texto de la portada. Vacíos, no se muestran.',
          fields: [
            {
              name: 'features',
              type: 'array',
              label: 'Qué hace distinto al servidor',
              labels: { singular: 'Característica', plural: 'Características' },
              maxRows: 8,
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Título' },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  label: 'Explicación',
                  maxLength: 240,
                },
              ],
            },
            {
              name: 'rules',
              type: 'array',
              label: 'Reglas rápidas',
              labels: { singular: 'Regla', plural: 'Reglas' },
              maxRows: 10,
              admin: {
                description: 'Las esenciales. Las largas van en un artículo de la wiki.',
                initCollapsed: true,
              },
              fields: [
                { name: 'text', type: 'text', required: true, label: 'Regla', maxLength: 160 },
              ],
            },
          ],
        },
      ],
    },
  ],
}
