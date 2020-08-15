const globby = require("globby");
const os = require("os");
const fs = require("fs");
const path = require("path");

const log = (message, error) => {
  console.log(
    `%c[Volcano]%c ${message}`,
    `color: ${error ? "#fa5252" : "#228be6"};`,
    ""
  );
  if (error && typeof error !== "boolean") console.error(error);
};

const findPlugin = (id) => {
  console.warn(
    "Volcano warning: please use app.plugins.getPluginById instead of findPlugin."
  );
  return app.plugins.getPluginById(id);
};

const loadPlugin = (pluginFile) => {
  log(`Loading ${pluginFile}...`);
  try {
    const getPlugin = require(path.join(pluginsPath, pluginFile));
    const plugin = getPlugin({ findPlugin, SettingTab });

    app.plugins.loadPlugin(plugin);

    if (
      (plugin.defaultOn || app.vault.config.pluginEnabledStatus[plugin.id]) &&
      !plugin.enabled
    ) {
      log(`Enabling ${pluginFile}`);
      app.plugins.getPluginById(plugin.id).enable(app);
    }

    log(`Loaded ${pluginFile}`);
  } catch (error) {
    log(`Error loading ${pluginFile}`, error);
  }
};

const loadPluginFromManifest = (pluginManifestFile) => {
  log(`Loading ${pluginManifestFile}...`);
  try {
    const manifest = require(pluginManifestFile);
    const getPlugin = require(path.join(
      pluginManifestFile,
      "..",
      manifest.main
    ));

    const SettingTab = app.plugins.getPluginById("daily-notes").settingTab
      .constructor;

    const plugin = getPlugin({ findPlugin, SettingTab });
    app.plugins.loadPlugin(plugin);

    if (
      (plugin.defaultOn || app.vault.config.pluginEnabledStatus[plugin.id]) &&
      !plugin.enabled
    ) {
      log(`Enabling ${manifest.name}`);
      app.plugins.getPluginById(plugin.id).enable(app);
    }

    log(`Loaded ${manifest.name}`);
  } catch (error) {
    log(`Error loading ${manifest.name}`, error);
  }
};

(async () => {
  // Wait until app is ready...
  // Is there a better way to do this?
  await new Promise((resolve) => {
    const checkApp = () =>
      !!(window.app && window.app.plugins && window.app.plugins.plugins);
    if (checkApp()) resolve(window.app);
    const interval = setInterval(() => {
      if (checkApp()) {
        clearInterval(interval);
        resolve(window.app);
      }
    }, 200);
  });

  const volcanoPath = path.join(os.homedir(), "volcano");
  const pluginsPath = path.join(volcanoPath, "plugins");

  log(`Making sure ${pluginsPath} exists...`);
  await fs.promises.mkdir(pluginsPath, { recursive: true });

  log("Loading plugins...");

  // Support single file plugins
  const singleFilePluginFiles = await fs.promises.readdir(pluginsPath);
  for (let pluginFile of singleFilePluginFiles) {
    if (!pluginFile.endsWith(".js")) continue;
    loadPlugin(pluginFile);
  }

  // Support plugins inside their own directories
  const pluginFiles = await globby(`${pluginsPath}/*/package.json`);
  pluginFiles.forEach((pluginFile) => {
    loadPluginFromManifest(pluginFile);
  });

  log("Process completed");
})();
