class Settings {
  static sync (github, repo, config) {
    return new Settings(github, repo, config).update()
  }

  constructor (github, repo, config) {
    this.github = github
    this.repo = repo
    this.config = config
  }

  update () {
    const arr = Object.entries(this.config).sort().reverse()
    console.log("The map array: " + arr)
    return Promise.all(Object.entries(this.config).sort().reverse().map(([section, config]) => {
      console.log("section " + section)
      const debug = { repo: this.repo }
      debug[section] = config

      const Plugin = Settings.PLUGINS[section]
      return new Plugin(this.github, this.repo, config).sync()
    }))
  }
}

Settings.FILE_NAME = '.github/settings.yml'

Settings.PLUGINS = {
  repository: require('./plugins/repository'),
  teams: require('./plugins/teams'),
  labels: require('./plugins/labels'),
  collaborators: require('./plugins/collaborators'),
  milestones: require('./plugins/milestones'),
  branches: require('./plugins/branches')
}

module.exports = Settings
