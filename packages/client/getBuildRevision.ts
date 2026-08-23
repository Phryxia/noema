import { execSync } from 'node:child_process'

export interface BuildRevision {
  count: string
  hash: string
}

export function getBuildRevision(): BuildRevision {
  try {
    return {
      count: readGitOutput('git rev-list --count HEAD'),
      hash: readGitOutput('git rev-parse --short=6 HEAD'),
    }
  } catch {
    return { count: '', hash: '' }
  }
}

function readGitOutput(command: string): string {
  return execSync(command, {
    cwd: import.meta.dirname,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}
