import { defineConfig } from "vite";
import * as dotenv from 'dotenv';
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/

dotenv.config({ path: `.env.${process.env.NODE_ENV}`});

export default defineConfig(({ mode }) => {
  process.env = {...process.env, ...require(`./.env.${mode}`)};
  return {
    base: mode === 'release' ? '/hanabi-tracker' : mode === 'testing' ? '/hanabi-tracker/test' : '/',
    plugins: [svelte()],
  };
});
