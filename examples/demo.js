/*
  This is a plugin I wrote to serve as a good example of several APIs in use.
  It includes a settings tab, a ribbon icon, and a global command.
*/

module.exports = ({ SettingTab }) => {
  class DemoSettings extends SettingTab {
    constructor(app, instance, plugin) {
      super(app, instance)
      this.plugin = plugin
    }

    display() {
      super.display()
      this.containerEl.empty()

      const pluginOptions = this.plugin.options

      const testSetting = this.addTextSetting(
        'Test setting',
        'This has literally no purpose.',
        'Example: foobar'
      )

      if (pluginOptions.test) testSetting.setValue(pluginOptions.test)

      testSetting.onChange(() => {
        pluginOptions.test = testSetting.getValue().trim()
        this.pluginInstance.saveData(pluginOptions)
      })
    }
  }

  class DemoPlugin {
    constructor() {
      this.id = 'demo'
      this.name = 'Demo plugin'
      this.description = 'A useless plugin to demo Volcano.'
      this.defaultOn = true

      this.app = null
      this.instance = null
      this.options = {}
    }

    init(app, instance) {
      this.app = app
      this.instance = instance

      this.instance.registerRibbonAction('Test ribbon', 'dice', () => this.onTrigger())

      this.instance.registerGlobalCommand({
        id: 'test',
        name: 'Test demo plugin',
        callback: () => this.onTrigger()
      })

      this.instance.registerSettingTab(new DemoSettings(app, instance, this))
    }

    async onEnable() {
			const options = await this.instance.loadData()
			this.options = options || {}
		}

    onTrigger() {
      alert(`You clicked me! My setting is set to "${this.options.test}"`)
    }
  }

  return new DemoPlugin()
}