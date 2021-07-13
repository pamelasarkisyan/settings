class Settings {
  static sync (github, repo, config) {
    return new Settings(github, repo, config).update()
  }

  constructor (github, repo, config) {
    this.github = github
    this.repo = repo
    this.config = config
  }

  executePluginSyncMethod (Plugin, github, repo, config) {
    return new Plugin(github, repo, config).sync()
  }

  update () {
    const arr = Object.entries(this.config).sort().reverse()
    const promiseResults = []
    let promiseError = null

    return new Promise((resolve, reject) => {
      const doNextPromise = index => {
        const [section, config] = arr[index]

        const debug = { repo: this.repo }
        debug[section] = config

        const Plugin = Settings.PLUGINS[section]
        const nextIndex = index + 1

        this.executePluginSyncMethod(Plugin, this.github, this.repo, config).then(result => {
          promiseResults.push(result)

          if (nextIndex < arr.length) {
            console.log('[Probot-Settings] Section: ' + section)
            doNextPromise(nextIndex)
          } else {
            console.log('[Probot-Settings] Section: ' + section)
            // all promises finished, so we need to resolve the promise with all the results to mimic the behavior of promise.all
            // incase one of the promises fails we need to also mimic the promise.all behavior and reject with the first rejection reason.
            if (promiseError !== null) {
              reject(promiseError)
            } else {
              resolve(promiseResults)
              console.log('[Probot-Settings] Result status: ' + promiseResults)
            }
          }
        }).catch(error => {
          console.log('[Probot-Settings] Result status error: ' + error + ' for Section: ' + section)

          if (promiseError === null) {
            promiseError = error
          }

          if (nextIndex < arr.length) {
            doNextPromise(nextIndex)
          } else {
            reject(promiseError)
            console.log('[Probot-Settings] Result status: ' + promiseResults + ' for Section: ' + section)
          }
          // incase one of the promises fails we need to also mimic the promise.all behavior and reject with the first rejection reason.
          // reject(error)
        })
      }
      doNextPromise(0)
    })
  }
}

Settings.FILE_NAME = '.github/settings.yml'

Settings.PLUGINS = {
  repository: require('./plugins/repository'),
  labels: require('./plugins/labels'),
  collaborators: require('./plugins/collaborators'),
  teams: require('./plugins/teams'),
  milestones: require('./plugins/milestones'),
  branches: require('./plugins/branches')
}

module.exports = Settings
