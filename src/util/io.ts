import fs from "fs"
import zlib from "zlib"
import { dirname, resolve } from "path"
import { Readable, Transform } from "stream"

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

export async function writeGzippedCsv(filename: string, source: AsyncIterable<any[]>) {
  await new Promise(function(resolve, reject) {
    Readable.from(source)
      .pipe(new Transform({
        objectMode: true,
        transform(chunk, encoding, done) {
          for (let i = 0; i < chunk.length; i++) {
            if (i == 0) {
              this.push(",")
            }
            if (chunk[i] == null) {
              this.push("\\N")
            } else if (/[\r\n,"\\]/.test(chunk[i])) {
              this.push('"' + chunk[i].replace(/"/g, '""') + '"')
            } else {
              this.push(chunk[i])
            }
          }
          this.push("\r\n")
          done()
        },
      }))
      .pipe(zlib.createGzip())
      .pipe(fs.createWriteStream(filename))
      .on("error", reject)
      .on("finish", resolve)
  })
}

export default {
  exists,
  isFile,
  isDirectory,
  findFileInParents,
}
