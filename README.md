# Volcano

A shitty plugin loader for [Obsidian](https://obsidian.md/).

I hacked this together in a few hours because there's currently no way to load your own plugins, I'll probably archive this when the awesome Obsidian team opens up an official API.

## Installation

Until I stop being lazy and add packing, you'll need [Node.js](https://nodejs.org/) to install Volcano. Once it's installed, run the following in a terminal:

```
npm install -g volcano
```

Then, run `volcano` to inject the plugin loader into the Obsidian executable. You'll have to re-run this whenever Obsidian updates.

## Plugins

Plugins are stored in the form of JavaScript files in the `~/volcano/plugins/` directory. Check out the [wiki](https://github.com/kognise/volcano/wiki) for more information on writing plugins.

You can download some plugins from [the volcano plugins repository](https://github.com/kognise/volcano-plugins).
