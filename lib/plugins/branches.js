const previewHeaders = { accept: 'application/vnd.github.hellcat-preview+json,application/vnd.github.luke-cage-preview+json,application/vnd.github.zzzax-preview+json' }

module.exports = class Branches {
  constructor (github, repo, settings) {
    this.github = github
    this.repo = repo
    this.branches = settings
  }

  sync () {
    return Promise.all(
      this.branches
        .filter(branch => branch.protection !== undefined)
        .map((branch) => {
          const params = Object.assign(this.repo, { branch: branch.name })

          if (this.isEmpty(branch.protection)) {
            return this.github.repos.deleteBranchProtection(params)
          } else {
            return new Promise ((resolve, reject) => (
              setTimeout(async () => {
                try { 
                  console.log("updateBranchProtection awaiting 5 secs...")
                  Object.assign(params, branch.protection, { headers: previewHeaders })
                  const value = await this.github.repos.updateBranchProtection(params)
                  resolve(value)
                  } catch (err) {
                    reject(err)
                  }
              }, 5000)
            ))
          }
        })
    )
  }

  isEmpty (maybeEmpty) {
    return (maybeEmpty === null) || Object.keys(maybeEmpty).length === 0
  }
}
