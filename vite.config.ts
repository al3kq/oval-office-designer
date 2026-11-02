import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // three.js alone minifies to ~700 kB, so a 3D vendor chunk cannot meet the 500 kB default.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'r3f', test: /node_modules[\\/](@react-three|three-stdlib|postprocessing|n8ao|maath)[\\/]/ },
          ],
        },
      },
    },
  },
})
