import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,           // listen on 0.0.0.0 if needed
    port: 8080,
    hmr: {
      protocol: 'ws',
      host: 'localhost',  // or your public hostname / IP
      clientPort: 80,     // the port the browser uses (Nginx)
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
}));
