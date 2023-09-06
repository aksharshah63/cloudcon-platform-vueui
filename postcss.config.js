// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  plugins: {
    "postcss-import": {
      resolve(id, basedir) {
        if (id.startsWith("@"))
          return path.resolve(__dirname, "src", id.slice(1));
        if (id.startsWith("~"))
          return path.resolve(__dirname, "./node_modules/", id.slice(1));
        return path.resolve(basedir, id);
      },
    },
    "postcss-simple-vars": {},
    "postcss-nested": {},
    "postcss-url": {
      url: "inline",
    },
    autoprefixer: {
      overrideBrowserslist: "> 1%, IE 6, Explorer >= 10, Safari >= 7",
    },
  },
};
