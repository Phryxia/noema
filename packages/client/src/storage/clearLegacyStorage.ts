const LEGACY_KEY_PREFIXES = ['lab/embedding/']

export function clearLegacyStorage(): void {
  try {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (LEGACY_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    return
  }
}
