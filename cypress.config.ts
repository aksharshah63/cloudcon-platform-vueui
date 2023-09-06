import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
  },

  component: {
    specPattern: "src/**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}",
    devServer: {
      framework: "vue-cli",
      bundler: "webpack",
    },
  },
});
