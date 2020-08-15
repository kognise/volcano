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

  const electron = require("electron");
  const fs = require("fs");
  const path = require("path");

  const volcanoPath = path.join(electron.remote.app.getPath("home"), "volcano");
  const pluginsPath = path.join(volcanoPath, "plugins");

  const SettingTab = app.plugins.getPluginById("daily-notes").settingTab
    .constructor;

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

  log(`Making sure ${pluginsPath} exists...`);
  await fs.promises.mkdir(pluginsPath, { recursive: true });

  log("Loading plugins...");

  const pluginFiles = await fs.promises.readdir(pluginsPath);
  for (let pluginFile of pluginFiles) {
    if (!pluginFile.endsWith(".js")) continue;
    loadPlugin(pluginFile);
  }

  log("Process completed");
})();
