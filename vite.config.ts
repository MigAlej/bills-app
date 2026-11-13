import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths so it works under https://<user>.github.io/<repo>/
  base: './',
  plugins: [react(), tailwindcss()],
})
