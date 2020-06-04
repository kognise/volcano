/*
  This is the official word count plugin, taken directly from Obsidian's
  obfuscated source code and extremely cleaned up.

  It serves as a good example for best practices considering it was
  written by the official developers.
*/

class WordCountPlugin {
  constructor() {
    this.id = 'word-count'
    this.name = 'Word count'
    this.description = 'Show word count in the status bar.'
    this.defaultOn = true
  }

  init(app, instance) {
    this.app = app
    this.instance = instance
    this.instance.registerStatusBarItem()
  }

  onEnable({ workspace }, instance) {
    instance.registerEvent(
      workspace.on('file-open', this.onFileOpen, this)
    )

    instance.registerEvent(
      workspace.on('quick-preview', this.onQuickPreview, this)
    )
  }

  async onFileOpen(file) {
    if (file && file.extension === 'md') {
      const contents = await this.app.vault.cachedRead(file)
      this.updateWordCount(contents)
    } else {
      this.updateWordCount('')
    }
  }

  onQuickPreview(file, contents) {
    const leaf = this.app.workspace.activeLeaf
    if (leaf && leaf.view.file === file) {
      this.updateWordCount(contents)
    }
  }

  updateWordCount(text) {
    const { statusBarEl } = this.instance
    if (!statusBarEl) return

    let words = 0

    const matches = text.match(
      /[a-zA-Z0-9_\u0392-\u03c9\u00c0-\u00ff\u0600-\u06ff]+|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/gm
    )

    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].charCodeAt(0) > 19968) {
          words += matches[i].length
        } else {
          words += 1
        }
      }
    }

    statusBarEl.empty()

    statusBarEl.createEl('span', {
      cls: 'status-bar-item-segment',
      text: `${words} uwu`
    })

    statusBarEl.createEl('span', {
      cls: 'status-bar-item-segment',
      text: `${text.length} owo`
    })
  }
}

module.exports = () => new WordCountPlugin()