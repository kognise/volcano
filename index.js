#!/usr/bin/env node

const fs = require("fs");
const asar = require("asar");
const path = require("path");
const prompts = require("prompts");
const chalk = require("chalk");
const semverSort = require("semver-sort");

const tempPrefix = "volcano-temp-";

const patchAsar = async (asarPath) => {
  const asarExtractTemp = await fs.promises.mkdtemp(tempPrefix);
  await asar.extractAll(asarPath, asarExtractTemp);

  const indexPath = path.join(asarExtractTemp, "index.html");
  const indexContent = await fs.promises.readFile(indexPath);
  await fs.promises.writeFile(
    indexPath,
    indexContent
      .toString()
      .replace(
        '<script type="text/javascript" src="app.js"></script></body>',
        '<script type="text/javascript" src="app.js"></script><script type="text/javascript" src="volcano.js"></script></body>'
      )
      .replace(
        `script-src 'self' 'unsafe-inline' blob:; frame-src 'self' https://*:*; style-src 'self' 'unsafe-inline';`,
        `script-src * 'unsafe-inline' 'unsafe-eval' blob:; frame-src 'self' https://*:*; style-src * 'unsafe-inline';`
      )
  );

  const volcanoContent = await fs.promises.readFile(
    require.resolve("./dist/volcano.js")
  );
  await fs.promises.writeFile(
    path.join(asarExtractTemp, "volcano.js"),
    volcanoContent
  );

  await fs.promises.unlink(asarPath);
  await asar.createPackage(asarExtractTemp, asarPath);

  await fs.promises.rmdir(asarExtractTemp, { recursive: true });
};

const getLatestAsarPath = async (asPath) => {
  try {
    const filePaths = await fs.promises.readdir(asPath);
    const versions = filePaths
      .filter((path) => path.match(/^obsidian-\d+\.\d+\.\d+.asar$/))
      .map((path) => path.slice(9, -5));

    if (versions.length > 0) {
      const sorted = semverSort.desc(versions);
      return `obsidian-${sorted[0]}.asar`;
    } else if (filePaths.includes("obsidian.asar")) {
      return "obsidian.asar";
    }
  } catch {}
};

const getInitialAsarPath = async () => {
  if (process.platform === "darwin") {
    const asPath = path.join(
      process.env.HOME,
      "Library/Application Support/obsidian"
    );
    const latestAsarPath = await getLatestAsarPath(asPath);
    if (latestAsarPath) return path.join(asPath, latestAsarPath);

    return "/Applications/Obsidian.app/Contents/Resources/obsidian.asar";
  } else if (process.platform === "win32") {
    const asPath = path.join(process.env.APPDATA, "obsidian");
    const latestAsarPath = await getLatestAsarPath(asPath);
    if (latestAsarPath) return path.join(asPath, latestAsarPath);

    return path.resolve(process.env.APPDATA, "..\\Local\\Obsidian\\resources");
  } else if (process.platform === "linux") {
    const asPath = path.join(process.env.HOME, ".config/obsidian");
    const latestAsarPath = await getLatestAsarPath(asPath);
    if (latestAsarPath) return path.join(asPath, latestAsarPath);
  }
};

(async () => {
  const response = await prompts({
    type: "text",
    name: "asarPath",
    message: "What is the path to obsidian.asar?",
    required: true,
    initial: await getInitialAsarPath(),
  });
  if (!response.asarPath) return;

  console.log(chalk.blue("Patching asar..."));
  await patchAsar(response.asarPath);
  console.log(chalk.green("Done! Launch Obsidian to get started."));
})();
