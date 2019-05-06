import glob from '../modules/dat-glob.js'
import isGlob from '../vendor/is-glob-v4.0.1.js'
import joinPath from '../modules/join-path.js'
import publicState from '../modules/dterm-public-state.js'

export default async function* (opts, ...patterns) {
  let pattern, file

  for (pattern of patterns) {
    let cwd = pattern.startsWith('~')
      ? publicState.home
      : publicState.cwd

    pattern = resolve(pattern, cwd)

    if (!isGlob(pattern)) {
      yield read(cwd.archive, pattern)
      continue
    }
    for await (file of glob(cwd.archive, pattern)) {
      yield read(cwd.archive, file)
    }
  }
}

function resolve (path, cwd) {
  path = path.replace(/^~/, '')

  if (path.startsWith('/')) return path
  return joinPath(cwd.path, path)
}

async function read (dat, file) {
  try {
    return await dat.readFile(file)
  } catch (err) {
    return err
  }
}