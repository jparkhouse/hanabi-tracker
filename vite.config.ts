import { defineConfig } from "vite";
import * as dotenv from 'dotenv';
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from 'svelte-preprocess';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const envPath = `.env.${mode}`;
  dotenv.config({ path: envPath });

  return {
    base: mode === 'release' ? '/hanabi-tracker' : mode === 'testing' ? '/hanabi-tracker/test' : '/dev',
    plugins: [svelte({
      preprocess: sveltePreprocess(),
    })],
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
    },
  };
});
