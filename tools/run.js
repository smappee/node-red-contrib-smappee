const fs = require('fs')
const resolve = require('path').resolve
const join = require('path').join
const cp = require('child_process')
const os = require('os')

// Get parent directory path
const dir = resolve(__dirname, '../')

function run (commands, options) {
  console.info(`Starting '${commands.join(' ')}'...`,)

  return new Promise((resolve, reject) => {
    // Install child packages
    fs.readdirSync(dir)
      .forEach(function (mod) {
        const modPath = join(dir, mod)

        // Ensure path has package.json
        if (!fs.existsSync(join(modPath, 'package.json'))) {
          return
        }

        // Binary based on OS
        const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm'

        // Install folder
        cp.spawn(npmCmd, commands, {env: process.env, cwd: modPath, stdio: 'inherit'})
      })
  })
}

if (require.main === module && process.argv.length > 2) {
  delete require.cache[__filename]

  // Run commands
  run(process.argv.splice(2))
}

module.exports = run
