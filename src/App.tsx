import { useEffect, useRef, useState } from 'react'
import { Scene } from './scene/Scene'
import type { BikeLayout } from './scene/Bike'
import { BIKE_NAME, CONTROLS, MODEL_CREDIT, type ControlId, type Vec3 } from './lesson/controls'

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
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [seen, setSeen] = useState<ReadonlySet<ControlId>>(new Set())
  const [layout, setLayout] = useState<BikeLayout | null>(null)

  const active = phase === 'learn' ? CONTROLS[index] : null
  const view = !layout ? FALLBACK_VIEW : active ? layout.views[active.id] : compact ? layout.compact : layout.overview

  // La ficha activa siempre queda a la vista dentro del panel.
  const activeCard = useRef<HTMLLIElement>(null)
  useEffect(() => {
    activeCard.current?.scrollIntoView({ block: compact ? 'start' : 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [index, phase, reducedMotion, compact])

  const study = (id: ControlId) => {
    setIndex(CONTROLS.findIndex((c) => c.id === id))
    setPhase('learn')
  }

  const next = () => {
    if (phase === 'intro') return study(CONTROLS[0].id)
    if (phase === 'learn' && active) {
      const marked = new Set(seen).add(active.id)
      setSeen(marked)
      return index < CONTROLS.length - 1 ? setIndex(index + 1) : setPhase('done')
    }
    setSeen(new Set())
    setPhase('intro')
  }

  const back = () => {
    if (phase === 'learn') return index > 0 ? setIndex(index - 1) : setPhase('intro')
    if (phase === 'done') study(CONTROLS[0].id)
  }

  const nextLabel =
    phase === 'intro' ? 'Empezar' : phase === 'learn' ? (index < CONTROLS.length - 1 ? 'Siguiente' : 'Terminar') : 'Volver al inicio'
  const backLabel = phase === 'done' ? 'Repasar desde el primero' : 'Anterior'

  const status =
    phase === 'intro' ? '5 mandos' : phase === 'learn' ? `Mando ${index + 1} de ${CONTROLS.length}` : 'Lección completada'

  const title = phase === 'intro' ? 'Conoce los mandos' : active ? active.name : 'Ya conoces los mandos'
  const subtitle =
    phase === 'intro'
      ? 'Una moto se conduce con cinco mandos: dos manos y dos pies.'
      : active
        ? `${active.limb} · ${active.where}`
        : 'Toca cualquier mando, en la lista o en la moto, para repasarlo. Saber dónde está cada mando va antes de la práctica real; no la sustituye.'

  return (
    <div className="lesson" data-phase={phase}>
      <header className="bar">
        <span className="bar__tab">Lección 1</span>
        <span className="bar__name">Conoce los mandos</span>
        <span className="bar__status" aria-live="polite">{status}</span>
      </header>

      <main className="field">
        <div className="field__canvas">
          <Scene
            activeId={active?.id ?? null}
            learned={seen}
            layout={layout}
            onLayout={setLayout}
            showState
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

      <aside className="panel" aria-label="Los cinco mandos">
        <h2>{phase === 'done' ? 'Repaso' : 'Los cinco mandos'}</h2>
        <ol className="cards">
          {CONTROLS.map((c, i) => {
            const state = c.id === active?.id ? 'active' : seen.has(c.id) ? 'learned' : 'pending'
            return (
              <li key={c.id} className="card" data-state={state} ref={state === 'active' ? activeCard : undefined}>
                <button type="button" className="card__head" aria-expanded={state === 'active'} onClick={() => study(c.id)}>
                  <span className="card__num">{i + 1}</span>
                  <span className="card__name">{c.name}</span>
                  <span className="card__limb">{c.limb}</span>
                  {state === 'learned' && (
                    <span className="card__done">
                      <Check />
                      <span className="sr">Visto</span>
                    </span>
                  )}
                </button>
                {state === 'active' && (
                  <dl className="card__body">
                    <dt>Qué hace</dt>
                    <dd>{c.does}</dd>
                    <dt>El gesto</dt>
                    <dd>{c.gesture}</dd>
                    <dt>Seguridad</dt>
                    <dd>{c.safety}</dd>
                    <dt>En la R1</dt>
                    <dd>{c.fact}</dd>
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
        <ol className="stripe" aria-label={`Progreso: ${status}`}>
          {CONTROLS.map((c) => (
            <li key={c.id} data-painted={phase === 'done' || seen.has(c.id)} />
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
