import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Scene } from './scene/Scene'
import type { BikeLayout } from './scene/Bike'
import type { StageLayout } from './scene/Stage'
import { LESSONS, type Section, type Vec3 } from './lesson/lessons'
import { BIKES, DEFAULT_BIKE } from './lesson/bikes'

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
  // La lección y el tema pueden venir en la dirección (?leccion=3&tema=2): sirve para compartir un enlace directo.
  const start = useMemo(() => {
    const q = new URLSearchParams(window.location.search)
    const li = Math.max(0, LESSONS.findIndex((l) => l.number === Number(q.get('leccion'))))
    const t = Number(q.get('tema'))
    const has = t >= 1 && t <= LESSONS[li].items.length
    return { li, phase: (has ? 'learn' : 'intro') as Phase, index: has ? t - 1 : 0 }
  }, [])
  const [lessonIndex, setLessonIndex] = useState(start.li)
  const [phase, setPhase] = useState<Phase>(start.phase)
  const [index, setIndex] = useState(start.index)
  /** Temas vistos, por lección. */
  const [seenBy, setSeenBy] = useState<Record<string, ReadonlySet<string>>>({})
  const [layout, setLayout] = useState<BikeLayout | null>(null)
  const [stageLayout, setStageLayout] = useState<StageLayout | null>(null)
  // La moto puede venir en la dirección (?moto=vespa): sirve para compartir un enlace directo.
  const [bike, setBike] = useState(() => BIKES.find((b) => b.id === new URLSearchParams(window.location.search).get('moto')) ?? DEFAULT_BIKE)

  const lesson = LESSONS[lessonIndex]
  const items = lesson.items
  const seen = seenBy[lesson.id] ?? new Set<string>()
  const active = phase === 'learn' ? items[index] : null
  const nextLesson = LESSONS[lessonIndex + 1]
  // Escenario del tema abierto (o el de la lección): la moto sola o una escena 3D con la moto dentro.
  const stageId = (active ?? items[0]).stage ?? 'bike'
  const stageData = stageId !== 'bike' && stageLayout?.id === stageId ? stageLayout : null
  const stage = stageId === 'bike' ? layout : stageData
  const view = !stage ? FALLBACK_VIEW : active && stage.views[active.id] ? stage.views[active.id] : compact ? stage.compact : stage.overview
  // Sin escenario la moto está en el centro; en uno, donde dice el tema o el escenario (o no sale).
  const bikePose = stageId === 'bike' ? undefined : (active?.bikePose ?? stageData?.bike ?? null)
  const dim = stageData?.dim ?? 1
  const loading = !layout || !stage

  // La ficha activa siempre queda a la vista dentro del panel.
  const activeCard = useRef<HTMLLIElement>(null)
  useEffect(() => {
    activeCard.current?.scrollIntoView({ block: compact ? 'start' : 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [index, phase, lessonIndex, reducedMotion, compact])

  // Al cambiar de moto el modelo nuevo calcula su propia distribución: hasta entonces no hay marcadores.
  const chooseBike = (id: string) => {
    const next = BIKES.find((b) => b.id === id)
    if (!next || next.id === bike.id) return
    setLayout(null)
    setBike(next)
    const url = new URL(window.location.href)
    if (next.id === DEFAULT_BIKE.id) url.searchParams.delete('moto')
    else url.searchParams.set('moto', next.id)
    window.history.replaceState(null, '', url)
  }

  /** La ficha de un tema: sus filas, el dato de la moto elegida y, en los mandos, el aviso si esta moto no los mueve. */
  const sectionsOf = (item: (typeof items)[number]): Section[] => {
    const rows = [...item.sections]
    const fact = item.facts?.[bike.id]
    if (fact) rows.push(fact)
    if (item.gesture && !bike.gestures) {
      rows.push({
        label: 'Ojo',
        text: `Este tema describe una moto manual como la Yamaha R1. En la ${bike.name} los mandos pueden estar en otro sitio o ser otros: revisa siempre el manual de tu moto.`,
      })
    }
    return rows
  }

  // La dirección refleja dónde estás, para poder compartirla.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (lessonIndex > 0) url.searchParams.set('leccion', String(lesson.number))
    else url.searchParams.delete('leccion')
    if (phase === 'learn') url.searchParams.set('tema', String(index + 1))
    else url.searchParams.delete('tema')
    window.history.replaceState(null, '', url)
  }, [lessonIndex, lesson.number, phase, index])

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
        <div className="bar__lessons">
          <span className="bar__tab">Lección {lesson.number}</span>
          <label className="sr" htmlFor="lesson-picker">Ir a otra lección</label>
          <select id="lesson-picker" className="bar__select" value={lessonIndex} onChange={(e) => openLesson(Number(e.target.value))}>
            {LESSONS.map((l, i) => (
              <option key={l.id} value={i}>
                {l.number}. {l.title}
              </option>
            ))}
          </select>
        </div>
        <span className="bar__status" aria-live="polite">{status}</span>
      </header>

      <main className="field">
        <div className="field__canvas">
          <Scene
            bike={bike}
            stageId={stageId}
            onStageLayout={setStageLayout}
            bikePose={bikePose}
            dim={dim}
            bikeActiveId={stageId === 'bike' ? (active?.id ?? null) : null}
            items={items}
            activeId={active?.id ?? null}
            seen={seen}
            layout={stage}
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
        {loading && <p className="field__loading" role="status">Cargando…</p>}
        <p className="field__hint">Arrastra para girar la vista. Rueda o pellizca para acercarte.</p>
      </main>

      <aside className="panel" aria-label={`Temas: ${lesson.title}`}>
        <div className="picker">
          <label htmlFor="bike-picker">Moto</label>
          <select id="bike-picker" value={bike.id} onChange={(e) => chooseBike(e.target.value)}>
            {BIKES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.kind}
              </option>
            ))}
          </select>
        </div>

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
                    {sectionsOf(item).map((s) => (
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
          <strong>{bike.name}</strong>
          <span>
            Proyecto educativo no oficial · Modelo 3D{' '}
            <a href={bike.credit.url} target="_blank" rel="noreferrer">«{bike.credit.title}»</a> de {bike.credit.author},{' '}
            <a href={bike.credit.licenseUrl} target="_blank" rel="noreferrer">{bike.credit.license}</a>
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
