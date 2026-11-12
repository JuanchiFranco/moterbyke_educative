import { expect, test, type Page } from '@playwright/test'
import { LESSONS } from '../src/lesson/lessons'
import { RIDES, trackFor } from '../src/scene/rides'

/** Errores de la consola que no son del curso (avisos de three.js sobre APIs en desuso, etc.). */
const IGNORED = /THREE\.|PCFSoftShadowMap|React DevTools|Download the React/

function watchErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORED.test(m.text())) errors.push(`console: ${m.text()}`)
  })
  return errors
}

async function ready(page: Page) {
  await page.waitForSelector('h1')
  await page.waitForSelector('.field__loading', { state: 'detached', timeout: 150_000 })
  // El primer fotograma de la escena tarda un instante tras cargar.
  await page.waitForTimeout(800)
}

async function open(page: Page, lesson: number, tema?: number) {
  await page.goto(`/?leccion=${lesson}${tema ? `&tema=${tema}` : ''}`)
  await ready(page)
}

test('las 15 lecciones están en el selector y cada tema se abre sin errores', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 1)
  await expect(page.locator('#lesson-picker option')).toHaveCount(LESSONS.length)

  for (let i = 0; i < LESSONS.length; i++) {
    const lesson = LESSONS[i]
    await page.selectOption('#lesson-picker', String(i))
    await expect(page.locator('h1')).toHaveText(lesson.title)
    for (let t = 0; t < lesson.items.length; t++) {
      await page.getByRole('button', { name: /Empezar|Siguiente/ }).click()
      await expect(page.locator('h1')).toHaveText(lesson.items[t].name)
    }
    // Termina la lección: el último «Siguiente» lleva al repaso o a la lección siguiente, sin romper nada.
    await page.waitForTimeout(150)
  }
  expect(errors, errors.join('\n')).toEqual([])
})

test('los enlaces directos ?leccion=&tema= abren el tema pedido', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 9, 7)
  await expect(page.locator('h1')).toHaveText(LESSONS[8].items[6].name)
  expect(errors, errors.join('\n')).toEqual([])
})

test('ningún tema de escenario apunta a un grupo que no existe', async ({ page }) => {
  const warnings: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'warning' && /\[escenario\]/.test(m.text())) warnings.push(m.text())
  })
  await open(page, 4)
  for (const stage of ['road', 'surfaces', 'braking', 'following', 'yard', 'signs', 'markings', 'intersection', 'traffic', 'lanechange', 'curve', 'slope', 'rain', 'night', 'incident']) {
    const l = LESSONS.findIndex((x) => x.items.some((i) => i.stage === stage))
    if (l < 0) continue
    await page.selectOption('#lesson-picker', String(l))
    await page.getByRole('button', { name: /Empezar|Siguiente/ }).click()
    for (let k = 0; k < LESSONS[l].items.length; k++) {
      await page.waitForTimeout(250)
      await page.getByRole('button', { name: /Siguiente/ }).click({ trial: false }).catch(() => {})
    }
  }
  expect(warnings, warnings.join('\n')).toEqual([])
})

// Recorridos de la moto -------------------------------------------------------------------------------------------

const where = (id: string) => {
  for (let l = 0; l < LESSONS.length; l++) {
    const t = LESSONS[l].items.findIndex((i) => i.id === id)
    if (t >= 0) return { lesson: LESSONS[l].number, tema: t + 1 }
  }
  throw new Error(`El tema ${id} no existe`)
}

interface Ride {
  x: number
  z: number
  yaw: number
  lean: number
  s: number
  len: number
  wait: number
  speed: number
  wheels: number
  spin: number[]
}

for (const id of Object.keys(RIDES)) {
  test(`la moto actúa «${id}»`, async ({ page }) => {
    const errors = watchErrors(page)
    // El reloj de la moto corre 6 veces más rápido: con WebGL por software los fotogramas son lentos.
    await page.addInitScript(() => ((window as unknown as { __rideScale: number }).__rideScale = 6))
    const { lesson, tema } = where(id)
    await open(page, lesson, tema)
    const spec = RIDES[id]
    const track = trackFor(id)!
    const first = spec.points[0]
    const last = spec.points[spec.points.length - 1]
    const midPauses = spec.points.filter((p, i) => p[3] && i > 0 && i < spec.points.length - 1).length

    const samples: Ride[] = []
    const t0 = Date.now()
    let reachedEnd = false
    while (Date.now() - t0 < 100_000) {
      const r = (await page.evaluate(() => (window as unknown as { __ride?: Ride }).__ride)) as Ride | undefined
      if (r) {
        samples.push(r)
        if (r.s >= r.len - 0.05 && r.wait > 0) {
          reachedEnd = true
          break
        }
      }
      await page.waitForTimeout(60)
    }
    await page.screenshot({ path: `test-results/escenas/${id}.png` })

    expect(samples.length, 'la moto no emitió su estado').toBeGreaterThan(3)
    expect(reachedEnd, `no llegó al final del recorrido (s=${samples.at(-1)?.s}/${track.length})`).toBe(true)

    // Empieza donde dice el recorrido y termina donde dice.
    const end = samples.at(-1)!
    expect(Math.hypot(end.x - last[0], end.z - last[1])).toBeLessThan(0.6)
    const early = samples[0]
    expect(Math.hypot(early.x - first[0], early.z - first[1])).toBeLessThan(track.length * 0.6)

    // Nunca se sale de la caja del recorrido y no se inclina más de lo razonable.
    const xs = spec.points.map((p) => p[0])
    const zs = spec.points.map((p) => p[1])
    const pad = 2
    for (const s of samples) {
      expect(s.x).toBeGreaterThan(Math.min(...xs) - pad)
      expect(s.x).toBeLessThan(Math.max(...xs) + pad)
      expect(s.z).toBeGreaterThan(Math.min(...zs) - pad)
      expect(s.z).toBeLessThan(Math.max(...zs) + pad)
      expect(Math.abs(s.lean)).toBeLessThanOrEqual(0.51)
    }

    // Avanza de verdad (no se queda quieta) y se detiene en cada parada prevista.
    expect(Math.max(...samples.map((s) => s.s)) - Math.min(...samples.map((s) => s.s))).toBeGreaterThan(track.length * 0.5)
    const stopped = new Set(samples.filter((s) => s.wait > 0 && s.s < s.len - 0.5).map((s) => Math.round(s.s)))
    if (midPauses) expect(stopped.size, 'no se detuvo donde debía').toBeGreaterThanOrEqual(1)

    // Las ruedas giran (R1 y Vespa traen las dos ruedas por separado).
    expect(samples[0].wheels).toBeGreaterThan(0)
    expect(new Set(samples.map((s) => (s.spin ?? []).slice(0, 3).map((v) => v.toFixed(3)).join())).size).toBeGreaterThan(2)

    expect(errors, errors.join('\n')).toEqual([])
  })
}

test('con movimiento reducido la moto no se mueve', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.addInitScript(() => ((window as unknown as { __rideScale: number }).__rideScale = 6))
  const { lesson, tema } = where('fis_reaccion')
  await open(page, lesson, tema)
  await page.waitForTimeout(1500)
  const a = (await page.evaluate(() => (window as unknown as { __ride?: Ride }).__ride)) as Ride
  await page.waitForTimeout(1500)
  const b = (await page.evaluate(() => (window as unknown as { __ride?: Ride }).__ride)) as Ride
  expect(a.s).toBe(0)
  expect(b.s).toBe(0)
  await ctx.close()
})

test('en la lección de la moto sola no hay recorrido', async ({ page }) => {
  await open(page, 1, 3)
  await page.waitForTimeout(1200)
  const r = await page.evaluate(() => (window as unknown as { __ride?: Ride }).__ride)
  expect(r).toBeUndefined()
})
