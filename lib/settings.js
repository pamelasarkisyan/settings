class Settings {
  static sync (github, repo, config) {
    return new Settings(github, repo, config).update()
  }

  constructor (github, repo, config) {
    this.github = github
    this.repo = repo
    this.config = config
  }

  executePluginSyncMethod(Plugin, github, repo, config) {
    return new Plugin(github, repo, config).sync()
  }

  update () {
    const arr = Object.entries(this.config).sort().reverse()
    const promiseResults = []

    return new Promise((resolve, reject) => {
      const doNextPromise = index => {
        const [section, config] = arr[index]
  
        const debug = { repo: this.repo }
        debug[section] = config
  
        const Plugin = Settings.PLUGINS[section]
        this.executePluginSyncMethod(Plugin, this.github, this.repo, config).then(result => {
          promiseResults.push(result)
  
          const nextIndex = index + 1
  
          if (nextIndex < arr.length) {
            console.log("[Probot] (then if) result is: " + result)
            console.log("[Probot] (then if) section is: " + section)
            doNextPromise(nextIndex)
          } else {
            console.log("[Probot] (then else) array is: " + arr)
            console.log("[Probot] (then else) section is: " + section)
            // all promises finished, so we need to resolve the promise with all the results to mimic the behavior of promise.all
            resolve(promiseResults)
          }
        }).catch(error => {
          console.log("[Probot] (catch error) array is: " + arr)
          console.log("[Probot] (catch error) section is: " + section)
          // incase one of the promises fails we need to also mimic the promise.all behavior and reject with the first rejection reason.
          reject(error)
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
