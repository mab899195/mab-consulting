import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/mab-consulting/webapps/rent-vs-buy-calc/',
  plugins: [react()],
})
