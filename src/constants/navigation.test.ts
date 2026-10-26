import { describe, expect, it } from 'vitest'
import { isActivePath } from '@/constants/navigation'

describe('isActivePath', () => {
  it.each([
    ['/mover/requests', '/mover/requests'],
    ['/mover/requests/42', '/mover/requests'],
  ])('%s는 %s 메뉴를 활성으로 본다', (pathname, href) => {
    expect(isActivePath(pathname, href)).toBe(true)
  })

  it.each([
    ['/requests', '/request'],
    ['/mover/quotes', '/mover/requests'],
    ['/', '/movers'],
  ])('%s는 %s 메뉴를 활성으로 보지 않는다', (pathname, href) => {
    expect(isActivePath(pathname, href)).toBe(false)
  })
})
