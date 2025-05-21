import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({  
  base: '/Project-Local-App/', // <-- ตรงกับชื่อ repo บน GitHub
  plugins: [react()],
})
