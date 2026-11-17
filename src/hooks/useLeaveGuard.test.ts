import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLeaveGuard } from '@/hooks/useLeaveGuard'

const router = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => router }))

function clickLink(href: string, init: MouseEventInit = {}) {
  const link = document.createElement('a')
  link.href = href
  link.append(document.createElement('span'))
  document.body.append(link)
  let isBlocked = false
  const stopNavigation = (event: MouseEvent) => {
    isBlocked = event.defaultPrevented
    event.preventDefault()
  }
  window.addEventListener('click', stopNavigation)
  link.firstElementChild?.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true, ...init }),
  )
  window.removeEventListener('click', stopNavigation)
  link.remove()
  return isBlocked
}

function unload() {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event
}

describe('useLeaveGuard', () => {
  const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState(null, '', '/mover/quotes/quote-1')
  })

  it('막을 내용이 없으면 이동을 막지 않는다', () => {
    const length = window.history.length
    renderHook(() => useLeaveGuard(false))

    expect(clickLink('/movers')).toBe(false)
    expect(unload().defaultPrevented).toBe(false)
    expect(window.history.length).toBe(length)
  })

  it('앱 안의 링크를 누르면 이동을 멈추고 나가기를 고르면 그 주소로 간다', () => {
    const { result } = renderHook(() => useLeaveGuard(true))

    let isBlocked = false
    act(() => {
      isBlocked = clickLink('/movers?page=2')
    })

    expect(isBlocked).toBe(true)
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.leave())

    expect(result.current.isOpen).toBe(false)
    expect(router.replace).toHaveBeenCalledWith('/movers?page=2')
  })

  it('머무르기를 고르면 이동하지 않는다', () => {
    const { result } = renderHook(() => useLeaveGuard(true))

    act(() => {
      clickLink('/movers')
    })
    act(() => result.current.stay())

    expect(result.current.isOpen).toBe(false)
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('새 탭으로 여는 링크, 외부 링크, 같은 페이지 링크는 막지 않는다', () => {
    const { result } = renderHook(() => useLeaveGuard(true))

    expect(clickLink('/movers', { metaKey: true })).toBe(false)
    expect(clickLink('https://example.com/')).toBe(false)
    expect(clickLink('/mover/quotes/quote-1#photos')).toBe(false)
    expect(result.current.isOpen).toBe(false)
  })

  it('새로고침이나 탭 닫기는 브라우저 확인 창으로 막는다', () => {
    renderHook(() => useLeaveGuard(true))

    expect(unload().defaultPrevented).toBe(true)
  })

  it('뒤로 가기를 누르면 페이지에 머문 채로 묻고 나가기를 고르면 이전 페이지로 간다', async () => {
    const length = window.history.length
    const { result } = renderHook(() => useLeaveGuard(true))

    expect(window.history.length).toBe(length + 1)

    act(() => window.history.go(-1))

    await waitFor(() => expect(result.current.isOpen).toBe(true))
    expect(window.location.pathname).toBe('/mover/quotes/quote-1')
    expect(window.history.length).toBe(length + 1)

    const go = vi.spyOn(window.history, 'go').mockImplementation(() => {})
    act(() => result.current.leave())

    expect(go).toHaveBeenCalledWith(-2)
    go.mockRestore()
  })

  it('막을 내용이 없어지면 추가한 기록을 지운다', () => {
    const { rerender } = renderHook(({ when }) => useLeaveGuard(when), {
      initialProps: { when: true },
    })

    rerender({ when: false })

    expect(back).toHaveBeenCalledOnce()
    expect(clickLink('/movers')).toBe(false)
  })

  it('나가기를 고른 뒤에는 브라우저 확인 창을 띄우지 않는다', () => {
    const { result } = renderHook(() => useLeaveGuard(true))

    act(() => {
      clickLink('/movers')
    })
    act(() => result.current.leave())

    expect(unload().defaultPrevented).toBe(false)
  })
})
