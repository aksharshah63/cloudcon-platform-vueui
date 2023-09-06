module.exports = {
  publicPath: "/",
  lintOnSave: false,
  filenameHashing: false,
  configureWebpack: {
    devtool: "source-map",
  },
  css: {
    extract: true,
    loaderOptions: {
      scss: {
        prependData: `@import "@/assets/styles/_variables.scss";`,
      },
    },
  },
  chainWebpack: (config) => {
    config.optimization.delete("splitChunks");
  },
};
