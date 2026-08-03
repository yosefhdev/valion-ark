'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export type SearchItem = { category: string; href: string; title: string }

/** Quita acentos para que "guias" encuentre "Guías". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
}

/**
 * Búsqueda tipo ⌘K. Filtra en cliente sobre los títulos ya cargados, que es
 * lo que el plan pide para empezar: sin índice ni endpoint. Si el contenido
 * crece, toca @payloadcms/plugin-search.
 *
 * Usa <dialog> nativo a propósito: el navegador ya trae el foco atrapado,
 * el cierre con Escape y el backdrop. Con un div habría que reimplementarlo.
 */
export function SearchDialog({ items }: { items: SearchItem[] }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const needle = normalize(query.trim())
  const results = needle
    ? items.filter((item) => normalize(`${item.title} ${item.category}`).includes(needle))
    : items.slice(0, 8)

  const open = useCallback(() => {
    setQuery('')
    setActive(0)
    dialogRef.current?.showModal()
  }, [])

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // Atajo global. Se registra una vez, no en cada tecleo.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (!isShortcut) return
      event.preventDefault()
      if (dialogRef.current?.open) close()
      else open()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [close, open])

  function go(item: SearchItem | undefined) {
    if (!item) return
    close()
    router.push(item.href)
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(results[active])
    }
  }

  return (
    <>
      <button
        className="font-hud flex items-center gap-2 border border-moss px-3 py-1.5 text-[11px] tracking-[0.18em] text-bone-dim uppercase transition-colors hover:border-element hover:text-element"
        onClick={open}
        type="button"
      >
        Buscar
        <kbd className="hidden opacity-60 sm:inline">Ctrl K</kbd>
      </button>

      <dialog
        aria-label="Buscar en la wiki"
        className="w-[min(36rem,calc(100vw-2rem))] bg-transparent p-0 backdrop:bg-obsidian/80"
        onClose={() => setQuery('')}
        ref={dialogRef}
      >
        <div className="panel bg-basalt p-4">
          <input
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded="true"
            autoComplete="off"
            className="font-hud w-full border border-moss bg-obsidian px-4 py-3 text-sm text-bone outline-none focus:border-element"
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Buscar artículos..."
            ref={inputRef}
            role="combobox"
            type="text"
            value={query}
          />

          {results.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-bone-dim">
              Nada coincide con «{query}».
            </p>
          ) : (
            <ul className="mt-3 max-h-80 overflow-y-auto" id="search-results" role="listbox">
              {results.map((item, i) => (
                <li key={item.href} role="presentation">
                  <button
                    aria-selected={i === active}
                    className={`flex w-full flex-col items-start px-3 py-2 text-left transition-colors ${
                      i === active ? 'bg-moss/50 text-element' : 'text-bone hover:bg-moss/30'
                    }`}
                    onClick={() => go(item)}
                    onMouseEnter={() => setActive(i)}
                    role="option"
                    type="button"
                  >
                    <span className="text-sm">{item.title}</span>
                    <span className="font-hud text-[10px] tracking-[0.18em] text-bone-dim uppercase">
                      {item.category}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  )
}
