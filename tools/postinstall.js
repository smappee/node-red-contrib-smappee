const fs = require('fs')
const resolve = require('path').resolve
const join = require('path').join
const cp = require('child_process')
const os = require('os')

// Get parent directory path
const dir = resolve(__dirname, '../')

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
    cp.spawn(npmCmd, ['install'], {env: process.env, cwd: modPath, stdio: 'inherit'})
  })
