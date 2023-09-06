const devPresets = ["@vue/babel-preset-app"];
//Not sure about the build presets
const buildPresets = [
  "@vue/babel-preset-app",
  // [
  //
  //   "@babel/preset-env",
  //   // Config for @babel/preset-env
  //   {
  //     // Example: Always transpile optional chaining/nullish coalescing
  //     include: [/(optional-chaining|nullish-coalescing)/],
  //   },
  // ],
  // "@babel/preset-typescript",
];
module.exports = {
  presets: process.env.NODE_ENV === "development" ? devPresets : buildPresets,
};
