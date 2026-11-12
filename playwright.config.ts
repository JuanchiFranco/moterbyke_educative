import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 240_000,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 760 },
    // WebGL por software: el entorno de pruebas no tiene por qué tener GPU.
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
