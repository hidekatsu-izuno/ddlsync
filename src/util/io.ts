import fs from 'fs'
import { dirname, resolve } from 'path';

export async function exists(path: string) {
  try {
    return !!(await fs.promises.lstat(path))
  } catch (e) {
    return false
  }
}

export async function isFile(path: string) {
  try {
    return (await fs.promises.lstat(path)).isFile()
  } catch (e) {
    return false
  }
}

export async function isDirectory(path: string) {
  try {
    return (await fs.promises.lstat(path)).isDirectory()
  } catch (e) {
    return false
  }
}

export async function findFileInParents(start: string, pattern: RegExp) {
	let dir = resolve('.', start);
	if (!await isDirectory(dir)) {
		dir = dirname(dir);
	}

	while (true) {
    for (let name of await fs.promises.readdir(dir)) {
      if (pattern.test(name)) {
        return resolve(dir, name);
      }
    }

    const prev = dir
		dir = dirname(dir);
		if (prev === dir) {
      break;
    }
	}
}

export default {
  exists,
  isFile,
  isDirectory,
  findFileInParents,
}
