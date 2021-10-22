const {
  override,
  addLessLoader,
  addWebpackAlias,
  addWebpackModuleRule,
  addWebpackPlugin,
  addBabelPlugin
} = require("customize-cra");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const CssUrlRelativePlugin = require("css-url-relative-plugin");
const getGitRepoInfo = require("git-repo-info");

const addWebWorkerLoader = loaderOptions => config => {
  const mergedLoaderOptions = Object.assign({}, loaderOptions);
  if (loaderOptions.use) {
    if (Array.isArray(loaderOptions.use)) mergedLoaderOptions.use = Array.from(loaderOptions.use);
    else mergedLoaderOptions.use = [loaderOptions.use];
  } else if (loaderOptions.loader) {
    delete mergedLoaderOptions.loader;
    delete mergedLoaderOptions.options;
    mergedLoaderOptions.use = [
      {
        loader: loaderOptions.loader,
        options: loaderOptions.options
      }
    ];
  } else throw new Error("loaderOptions should have .use or .loader");

  const rules = config.module.rules;
  for (const rule of rules) {
    if (rule.oneOf) {
      for (const one of rule.oneOf) {
        if (one.test.toString() === "/\\.(js|mjs|jsx|ts|tsx)$/" || one.test.toString() === "/\\.(js|mjs|jsx)$/") {
          if (!mergedLoaderOptions.include) mergedLoaderOptions.include = one.include;
          mergedLoaderOptions.use.push({
            loader: one.loader,
            options: one.options
          });

          rule.oneOf.unshift(mergedLoaderOptions);
          break;
        }
      }

      break;
    }
  }

  config.output["globalObject"] = "self";

  return config;
};

const patchHtmlWebpackPluginConfig = () => config => {
  // Ignore the header comment when minifying
  const pluginOptions = config.plugins[0].options;
  if (pluginOptions.minify) {
    pluginOptions.minify.ignoreCustomComments = [/Menci/];
  }

  // Disable built-in CSS/JS injection since we insert the tags dynamicly
  pluginOptions.inject = false;

  pluginOptions.gitRepoInfo = getGitRepoInfo();

  return config;
};

const removeServiceWorker = () => config => {
  config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== "GenerateSW");
  return config;
};

const useRelativePath = () => config => {
  config.output.publicPath = "./";
  return config;
};

const disableEsLint = () => config => {
  config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== "ESLintWebpackPlugin");
  return config;
};

const fixChunkSplitting = () => config => {
  config.optimization.splitChunks = {
    chunks: "all",
    minSize: 0,
    maxAsyncRequests: 99999,
    maxInitialRequests: 99999,
    cacheGroups: {
      common: {
        name: "common",
        chunks: "initial",
        priority: 2,
        minChunks: 2
      },
      styles: {
        test: /\.(css|scss|less)$/,
        enforce: true
      }
    }
  };

  return config;
};

const patchTerserOptions = () => config => {
  const terserOptions = config.optimization.minimizer[0].options.terserOptions;
  terserOptions.output.ascii_only = false;

  return config;
};

const disableInlineChunk = () => config => {
  config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== "InlineChunkHtmlPlugin");
  return config;
};

// fork-ts-checker-webpack-plugin take ALL my CPUs on my machine so my machine stucks every time
const disableTsCheckerOnDevelopment = () => config => {
  if (config.mode === "development" && process.env.SYZOJ_NG_APP_NO_TS_CHECKER)
    config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== "ForkTsCheckerWebpackPlugin");
  return config;
};

const addCssFileLoader = () => config => {
  function findStlyeLoaders() {
    const rules = config.module.rules;
    for (const rule of rules) {
      if (rule.oneOf) {
        for (const one of rule.oneOf) {
          if (one.test.toString() === /\.css$/.toString()) return [rule.oneOf, one.use];
        }
      }
    }

    throw new Error("Unable to find style loaders in Webpack configuration");
  }

  const [oneOf, styleLoaders] = findStlyeLoaders();

  const newStyleLoaders = [...styleLoaders]; // Copy the array
  newStyleLoaders.shift(); // Remove style-loader or MiniCssExtractPlugin.loader

  oneOf.unshift({
    test: /\.url.css/,
    use: ["file-loader", "extract-loader", ...newStyleLoaders]
  });

  return config;
};

module.exports = override(
  disableEsLint(),
  addLessLoader(),
  addWebpackModuleRule({
    test: /\.svg$/,
    use: ["file-loader", "svgo-loader"]
  }),
  addWebpackModuleRule({
    test: /\.wasm$/,
    type: "javascript/auto",
    loader: "file-loader"
  }),
  addWebpackModuleRule({
    test: require.resolve("./src/misc/fonts/ui-font-selectors"),
    loader: "val-loader"
  }),
  addWebpackModuleRule({
    test: `${__dirname}/src/locales/messages`,
    loader: "val-loader"
  }),
  addWebWorkerLoader({
    test: /\.worker\.(js|ts)$/,
    use: "workerize-loader"
  }),
  addWebpackAlias({
    ["@"]: __dirname + "/src",
    ["semantic-ui-css"]: "fomantic-ui-css",
    ["mobx-react"]: "mobx-react-lite"
  }),
  addWebpackPlugin(
    new MonacoWebpackPlugin({
      languages: ["yaml", "cpp", "java", "kotlin", "pascal", "python", "rust", "go", "csharp", "fsharp"],
      features: [
        "bracketMatching",
        "caretOperations",
        "clipboard",
        "contextmenu",
        "coreCommands",
        "cursorUndo",
        "find",
        "folding",
        "fontZoom",
        "gotoLine",
        "iPadShowKeyboard",
        "inPlaceReplace",
        "indentation",
        "linesOperations",
        "links",
        "multicursor",
        "smartSelect",
        "unusualLineTerminators"
      ]
    })
  ),
  addWebpackPlugin(new CssUrlRelativePlugin()),
  addBabelPlugin([
    "prismjs",
    {
      languages: Object.keys(require("prismjs/components.js").languages).filter(name => name !== "meta")
    }
  ]),
  patchHtmlWebpackPluginConfig(),
  removeServiceWorker(),
  useRelativePath(),
  fixChunkSplitting(),
  patchTerserOptions(),
  disableInlineChunk(),
  disableTsCheckerOnDevelopment(),
  addCssFileLoader()
);
