import { defineConfig } from "vite";
import * as dotenv from 'dotenv';
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Load environment variables based on the current mode
const loadEnv = (mode) => {
  const envPath = `.env.${mode}`;
  dotenv.config({ path: envPath });
};

export default defineConfig(({ mode }) => {
  // Load the environment variables for the specific mode
  loadEnv(mode);

  return {
    base: mode === 'release' ? '/hanabi-tracker' : mode === 'testing' ? '/hanabi-tracker/test' : '/',
    plugins: [svelte()],
  };
});
