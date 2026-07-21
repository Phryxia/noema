import { expect, test } from 'vitest'
import { hello } from '@rayelxia/shared' // if you build to js, you must change this by relative path

test('server package test', () => {
  expect(hello()).toBeTruthy()
})
