import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Scene } from './scene/Scene'
import type { BikeLayout } from './scene/Bike'
import { BIKE_NAME, LESSONS, MODEL_CREDIT, type Vec3 } from './lesson/lessons'

type Phase = 'intro' | 'learn' | 'done'

/** Encuadre mientras el modelo carga; después manda el que se calcula a partir de él. */
const FALLBACK_VIEW: { position: Vec3; target: Vec3 } = { position: [2.1, 1.3, 2.5], target: [0, 0.6, 0] }

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

function Check() {
  return (
    <svg className="check" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function App() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  // Mismo corte que la hoja de estilos: por debajo, el título sale del campo 3D.
  const compact = useMediaQuery('(max-width: 60rem)')
  const [lessonIndex, setLessonIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  /** Temas vistos, por lección. */
  const [seenBy, setSeenBy] = useState<Record<string, ReadonlySet<string>>>({})
  const [layout, setLayout] = useState<BikeLayout | null>(null)

  const lesson = LESSONS[lessonIndex]
  const items = lesson.items
  const seen = seenBy[lesson.id] ?? new Set<string>()
  const active = phase === 'learn' ? items[index] : null
  const nextLesson = LESSONS[lessonIndex + 1]
  const view = !layout ? FALLBACK_VIEW : active && layout.views[active.id] ? layout.views[active.id] : compact ? layout.compact : layout.overview

  // La ficha activa siempre queda a la vista dentro del panel.
  const activeCard = useRef<HTMLLIElement>(null)
  useEffect(() => {
    activeCard.current?.scrollIntoView({ block: compact ? 'start' : 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [index, phase, lessonIndex, reducedMotion, compact])

  const markSeen = (id: string) => setSeenBy((s) => ({ ...s, [lesson.id]: new Set(s[lesson.id] ?? []).add(id) }))

  const study = (id: string) => {
    setIndex(items.findIndex((it) => it.id === id))
    setPhase('learn')
  }

  const openLesson = (i: number) => {
    setLessonIndex(i)
    setIndex(0)
    setPhase('intro')
  }

  const next = () => {
    if (phase === 'intro') return study(items[0].id)
    if (phase === 'learn' && active) {
      markSeen(active.id)
      return index < items.length - 1 ? setIndex(index + 1) : setPhase('done')
    }
    // Fin de la lección: sigue la siguiente o se vuelve al inicio de esta.
    return nextLesson ? openLesson(lessonIndex + 1) : openLesson(lessonIndex)
  }

  const back = () => {
    if (phase === 'learn') return index > 0 ? setIndex(index - 1) : setPhase('intro')
    if (phase === 'done') study(items[0].id)
  }

  const nextLabel =
    phase === 'intro'
      ? 'Empezar'
      : phase === 'learn'
        ? index < items.length - 1
          ? 'Siguiente'
          : 'Terminar'
        : nextLesson
          ? `Ir a la lección ${nextLesson.number}`
          : 'Volver al inicio'
  const backLabel = phase === 'done' ? 'Repasar desde el primero' : 'Anterior'

  const status =
    phase === 'intro'
      ? `${items.length} temas`
      : phase === 'learn'
        ? `Tema ${index + 1} de ${items.length}`
        : 'Lección completada'

  const title = phase === 'intro' ? lesson.title : active ? active.name : `Terminaste «${lesson.title}»`
  const subtitle =
    phase === 'intro'
      ? lesson.intro
      : active
        ? active.where
        : 'Toca cualquier tema, en la lista o en la moto, para repasarlo. Saber esto va antes de la práctica real; no la sustituye.'

  return (
    <div className="lesson" data-phase={phase}>
      <header className="bar">
        <nav className="bar__lessons" aria-label="Lecciones">
          {LESSONS.map((l, i) => (
            <button
              key={l.id}
              type="button"
              className={i === lessonIndex ? 'bar__tab' : 'bar__link'}
              aria-current={i === lessonIndex ? 'page' : undefined}
              onClick={() => i !== lessonIndex && openLesson(i)}
            >
              Lección {l.number}
            </button>
          ))}
        </nav>
        <span className="bar__name">{lesson.title}</span>
        <span className="bar__status" aria-live="polite">{status}</span>
      </header>

      <main className="field">
        <div className="field__canvas">
          <Scene
            items={items}
            activeId={active?.id ?? null}
            seen={seen}
            layout={layout}
            onLayout={setLayout}
            view={view}
            reducedMotion={reducedMotion}
            onPick={study}
          />
        </div>
        <div className="field__title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <p className="field__hint">Arrastra para girar la moto. Rueda o pellizca para acercarte.</p>
      </main>

      <aside className="panel" aria-label={`Temas: ${lesson.title}`}>
        <h2>{phase === 'done' ? 'Repaso' : 'Temas'}</h2>
        <ol className="cards">
          {items.map((item, i) => {
            const state = item.id === active?.id ? 'active' : seen.has(item.id) ? 'learned' : 'pending'
            return (
              <li key={item.id} className="card" data-state={state} ref={state === 'active' ? activeCard : undefined}>
                <button type="button" className="card__head" aria-expanded={state === 'active'} onClick={() => study(item.id)}>
                  <span className="card__num">{i + 1}</span>
                  <span className="card__name">{item.name}</span>
                  <span className="card__limb">{item.tag}</span>
                  {state === 'learned' && (
                    <span className="card__done">
                      <Check />
                      <span className="sr">Visto</span>
                    </span>
                  )}
                </button>
                {state === 'active' && (
                  <dl className="card__body">
                    {item.sections.map((s) => (
                      <div key={s.label} className="card__row">
                        <dt>{s.label}</dt>
                        <dd>{s.text}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            )
          })}
        </ol>
      </aside>

      <footer className="foot">
        <div className="foot__model">
          <strong>{BIKE_NAME}</strong>
          <span>
            Proyecto educativo no oficial · Modelo 3D{' '}
            <a href={MODEL_CREDIT.url} target="_blank" rel="noreferrer">«{MODEL_CREDIT.title}»</a> de {MODEL_CREDIT.author},{' '}
            <a href={MODEL_CREDIT.licenseUrl} target="_blank" rel="noreferrer">{MODEL_CREDIT.license}</a>
          </span>
        </div>
        <ol className="stripe" style={{ '--n': items.length } as CSSProperties} aria-label={`Progreso: ${status}`}>
          {items.map((item) => (
            <li key={item.id} data-painted={seen.has(item.id)} />
          ))}
        </ol>
        <div className="foot__actions">
          <button type="button" className="btn" onClick={back} disabled={phase === 'intro'}>
            {backLabel}
          </button>
          <button type="button" className="btn btn--go" onClick={next}>
            {nextLabel}
          </button>
        </div>
      </footer>
    </div>
  )
}
