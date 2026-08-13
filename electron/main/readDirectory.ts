import { join, extname, basename } from 'path'
import * as fs from 'fs'
import { ALL_MODEL_EXTENSIONS } from '../../src/renderer/config/file-formats'

export interface FileEntry {
  name: string
  path: string
  mtimeMs: number
}

export interface DirNode {
  name: string
  path: string
  modelCount: number
  children?: DirNode[]
}

const SUPPORTED_EXTENSIONS = new Set(ALL_MODEL_EXTENSIONS)

export async function readDirectory(dirPath: string, recursive: boolean = false,
  maxDepth: number = 5,
  _depth: number = 0,): Promise<{ success: boolean; files?: FileEntry[]; tree?: DirNode; error?: string }> {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    const files: FileEntry[] = []
    const childDirs: DirNode[] = []

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          const fullPath = join(dirPath, entry.name)
          const stat = await fs.promises.stat(fullPath)
          files.push({ name: entry.name, path: fullPath, mtimeMs: stat.mtimeMs })
        }
      } else if (entry.isDirectory() && recursive && _depth < maxDepth) {
        const subResult = await readDirectory(
          join(dirPath, entry.name), recursive, maxDepth, _depth + 1
        )
        if (subResult.success) {
          files.push(...(subResult.files || []))
          if (subResult.tree) childDirs.push(subResult.tree)
        }
      }
    }
 
    const tree: DirNode = {
      name: basename(dirPath),
      path: dirPath,
      modelCount: files.length,
      children: childDirs.length > 0 ? childDirs : undefined,
    }
 
    return { success: true, files, tree }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
