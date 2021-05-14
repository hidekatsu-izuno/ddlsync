import { promises as fs } from 'fs'
import { dirname, resolve } from 'path';

export async function isFile(path: string) {
  try {
    return (await fs.lstat(path)).isFile()
  } catch (e) {
    return false
  }
}

export async function isDirectory(path: string) {
  try {
    return (await fs.lstat(path)).isDirectory()
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
    for (let name of await fs.readdir(dir)) {
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
  isFile,
  isDirectory,
  findFileInParents,
}
