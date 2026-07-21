import { expect, test } from 'vitest'
import { hello } from './index.ts'

test('shared package test', () => {
  expect(hello()).toBeTruthy()
})
