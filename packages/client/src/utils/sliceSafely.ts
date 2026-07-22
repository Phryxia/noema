const HIGH_SURROGATE_START = 0xd800
const HIGH_SURROGATE_END = 0xdbff

export function sliceSafely(value: string, length: number): string {
  const sliced = value.slice(0, length)
  const lastCharCode = sliced.charCodeAt(sliced.length - 1)
  if (lastCharCode >= HIGH_SURROGATE_START && lastCharCode <= HIGH_SURROGATE_END) {
    return sliced.slice(0, -1)
  }
  return sliced
}
