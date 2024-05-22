import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = {...process.env, ...require(`./.env.${mode}`)};
  return {
    base: mode === 'release' ? '/hanabi-tracker' : mode === 'testing' ? '/hanabi-tracker/test' : '/',
    plugins: [svelte()],
  };
});
