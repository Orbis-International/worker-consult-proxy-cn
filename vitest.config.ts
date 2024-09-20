import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,  // Enables global functions like describe, it, etc.
    environment: 'node',  // Set the test environment to Node.js
  },
});
