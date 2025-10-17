import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          vendor: ["react", "react-dom"],
          ethers: ["ethers"],
          router: ["react-router-dom"],
          ui: ["framer-motion", "lucide-react"],
          utils: ["axios"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
