import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'
import publicState from '../modules/dterm-public-state.js'
import resolvePath from '../modules/dterm-resolve-path.js'

import ls from './ls.js'

export default async function (opts = {}, ...args) {
  let cwd = publicState.cwd
  let location = getLocation(args)
  let version = getVersion(args)

  location = resolvePath(publicState.home, cwd, location)
  location = changeVersion(location, version)
  await setWorkingDir(location)

  if (publicState.env.config['ls-after-cd']) {
    return ls()
  }
}

function getLocation (args) {
  if (args.length > 1) return args[1].toString()
  return args[0] ? args[0].toString() : '~'
}

function getVersion (args) {
  if (args.length > 1) return args[0].toString()
}

function changeVersion (location, version) {
  if (!version) return location
  version = version.replace(/^\+/, '')
  let parts = location.split('/')
  let key = parts[1].split('+')[0]
  parts[1] = version === 'latest' ? key : `${key}+${version}`
  return parts.join('/')
}

async function setWorkingDir (location) {
  let cwd = parsePath(location)

  if (cwd) {
    // make sure the destination exists
    let st = await cwd.archive.stat(cwd.path)
    if (!st.isDirectory()) {
      throw new Error('Not a directory')
    }
  }
  publicState.cwd = cwd
}
