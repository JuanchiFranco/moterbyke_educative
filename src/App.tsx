import { useEffect, useMemo, useRef, useState } from 'react'
import { Scene } from './scene/Scene'
import type { BikeLayout } from './scene/Bike'
import { BIKE_NAME, CONTROLS, MODEL_CREDIT, type ControlId, type Vec3 } from './lesson/controls'

type Phase = 'intro' | 'learn' | 'quiz' | 'done'

/** Encuadre mientras el modelo carga; después manda el que se calcula a partir de él. */
const FALLBACK_VIEW: { position: Vec3; target: Vec3 } = { position: [2.1, 1.3, 2.5], target: [0, 0.6, 0] }

/** Orden de la prueba: distinto del de estudio para que no valga la memoria del orden. */
const QUIZ_ORDER: ControlId[] = ['clutch', 'rearBrake', 'throttle', 'shift', 'frontBrake']

const byId = (id: ControlId) => CONTROLS.find((c) => c.id === id)!

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
  const [learned, setLearned] = useState<ReadonlySet<ControlId>>(new Set())
  const [quizAt, setQuizAt] = useState(0)
  const [solved, setSolved] = useState<ReadonlySet<ControlId>>(new Set())
  const [misses, setMisses] = useState<ReadonlySet<ControlId>>(new Set())
  const [wrong, setWrong] = useState<ControlId | null>(null)
  const [layout, setLayout] = useState<BikeLayout | null>(null)

  const active = phase === 'learn' ? CONTROLS[index] : null
  const target = phase === 'quiz' ? byId(QUIZ_ORDER[quizAt]) : null
  const targetSolved = target ? solved.has(target.id) : false
  const view = !layout ? FALLBACK_VIEW : active ? layout.views[active.id] : compact ? layout.compact : layout.overview

  // La ficha activa siempre queda a la vista dentro del panel.
  const activeCard = useRef<HTMLLIElement>(null)
  useEffect(() => {
    activeCard.current?.scrollIntoView({ block: compact ? 'start' : 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [index, phase, reducedMotion, compact])

  const firstTry = useMemo(() => CONTROLS.filter((c) => !misses.has(c.id)).length, [misses])

  const study = (id: ControlId) => {
    setIndex(CONTROLS.findIndex((c) => c.id === id))
    setPhase('learn')
  }

  const answer = (id: ControlId) => {
    if (!target || targetSolved) return
    if (id === target.id) {
      setSolved((s) => new Set(s).add(id))
      setWrong(null)
    } else {
      setMisses((m) => new Set(m).add(target.id))
      setWrong(id)
    }
  }

  const onPick = (id: ControlId) => (phase === 'quiz' ? answer(id) : study(id))

  const startQuiz = () => {
    setQuizAt(0)
    setSolved(new Set())
    setMisses(new Set())
    setWrong(null)
    setPhase('quiz')
  }

  const next = () => {
    if (phase === 'intro') return study(CONTROLS[0].id)
    if (phase === 'learn' && active) {
      setLearned((l) => new Set(l).add(active.id))
      return index < CONTROLS.length - 1 ? setIndex(index + 1) : startQuiz()
    }
    if (phase === 'quiz') {
      setWrong(null)
      return quizAt < QUIZ_ORDER.length - 1 ? setQuizAt(quizAt + 1) : setPhase('done')
    }
    setLearned(new Set())
    setPhase('intro')
  }

  const back = () => {
    if (phase === 'learn') return index > 0 ? setIndex(index - 1) : setPhase('intro')
    if (phase === 'quiz' || phase === 'done') study(CONTROLS[0].id)
  }

  const nextLabel =
    phase === 'intro'
      ? 'Empezar'
      : phase === 'learn'
        ? index < CONTROLS.length - 1
          ? 'Entendido'
          : 'Ir a la prueba'
        : phase === 'quiz'
          ? quizAt < QUIZ_ORDER.length - 1
            ? 'Siguiente'
            : 'Terminar'
          : 'Repetir la lección'
  const backLabel = phase === 'quiz' || phase === 'done' ? 'Volver a estudiar' : 'Anterior'

  const status =
    phase === 'intro'
      ? '5 mandos'
      : phase === 'learn'
        ? `${learned.size} de 5 aprendidos`
        : phase === 'quiz'
          ? `Prueba: ${solved.size} de 5`
          : 'Lección completada'

  const title =
    phase === 'intro'
      ? 'Conoce los mandos'
      : active
        ? active.name
        : target
          ? `¿Dónde está el ${target.name.toLowerCase()}?`.replace('el palanca', 'la palanca')
          : 'Ya conoces los mandos'
  const subtitle =
    phase === 'intro'
      ? 'Una moto se conduce con cinco mandos: dos manos y dos pies.'
      : active
        ? `${active.limb} · ${active.where}`
        : target
          ? 'Tócalo en la moto o elige su posición en la lista.'
          : `Encontraste ${firstTry} de 5 a la primera. Saber dónde está cada mando va antes de la práctica real; no la sustituye.`

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
            learned={learned}
            layout={layout}
            onLayout={setLayout}
            showState={phase !== 'quiz'}
            view={view}
            reducedMotion={reducedMotion}
            onPick={onPick}
          />
        </div>
        <div className="field__title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <p className="field__hint">Arrastra para girar la moto. Rueda o pellizca para acercarte.</p>
      </main>

      <aside className="panel" aria-label={phase === 'quiz' ? 'Prueba' : 'Los cinco mandos'}>
        {phase === 'quiz' && target ? (
          <>
            <h2>Elige su posición</h2>
            <ul className="spots">
              {CONTROLS.map((c) => {
                const isRight = targetSolved && c.id === target.id
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="spot"
                      data-state={isRight ? 'right' : wrong === c.id ? 'wrong' : 'idle'}
                      disabled={targetSolved && !isRight}
                      onClick={() => answer(c.id)}
                    >
                      <span>{c.spot}</span>
                      {isRight && <Check />}
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="feedback" role="status" data-kind={targetSolved ? 'right' : wrong ? 'wrong' : 'none'}>
              {targetSolved
                ? `Correcto. ${target.name}: ${target.where.toLowerCase()}, ${target.limb.toLowerCase()}.`
                : wrong
                  ? `Ahí está otro mando: ${byId(wrong).name.toLowerCase()}. Prueba otra vez.`
                  : 'Sin pistas: en la moto ya no hay números.'}
            </p>
          </>
        ) : (
          <>
            <h2>{phase === 'done' ? 'Repaso' : 'Los cinco mandos'}</h2>
            <ol className="cards">
              {CONTROLS.map((c, i) => {
                const state = c.id === active?.id ? 'active' : learned.has(c.id) ? 'learned' : 'pending'
                return (
                  <li key={c.id} className="card" data-state={state} ref={state === 'active' ? activeCard : undefined}>
                    <button
                      type="button"
                      className="card__head"
                      aria-expanded={state === 'active'}
                      onClick={() => study(c.id)}
                    >
                      <span className="card__num">{i + 1}</span>
                      <span className="card__name">{c.name}</span>
                      <span className="card__limb">{c.limb}</span>
                      {state === 'learned' && (
                        <span className="card__done">
                          <Check />
                          <span className="sr">Aprendido</span>
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
          </>
        )}
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
          {CONTROLS.map((c) => {
            const painted = phase === 'quiz' ? solved.has(c.id) : phase === 'done' ? true : learned.has(c.id)
            return <li key={c.id} data-painted={painted} />
          })}
        </ol>
        <div className="foot__actions">
          <button type="button" className="btn" onClick={back} disabled={phase === 'intro'}>
            {backLabel}
          </button>
          <button type="button" className="btn btn--go" onClick={next} disabled={phase === 'quiz' && !targetSolved}>
            {nextLabel}
          </button>
        </div>
      </footer>
    </div>
  )
}
