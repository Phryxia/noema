export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

export function dot(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

export function sampleGaussian(): number {
  const u = Math.random()
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(1 - u)) * Math.cos(2 * Math.PI * v)
}
