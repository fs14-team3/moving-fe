import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function toInternalLink(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  ) {
    return null
  }
  const link = event.target.closest<HTMLAnchorElement>('a[href]')
  if (
    !link ||
    (link.target && link.target !== '_self') ||
    link.hasAttribute('download')
  ) {
    return null
  }
  const url = new URL(link.href)
  const { origin, pathname, search } = window.location
  if (url.origin !== origin || url.pathname + url.search === pathname + search)
    return null
  return url.pathname + url.search + url.hash
}

export function useLeaveGuard(when: boolean, fallbackHref: string) {
  const router = useRouter()
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null)
  const isLeaving = useRef(false)
  const isActive = when || pendingLeave !== null

  useEffect(() => {
    if (!isActive) return
    const { history, location } = window
    const href = location.href
    const { scrollRestoration } = history
    history.scrollRestoration = 'manual'
    history.pushState(history.state, '', href)
    const canGoBack = history.length > 2

    const ask = (go: () => void) =>
      setPendingLeave(() => () => {
        history.scrollRestoration = scrollRestoration
        go()
      })

    const warn = (event: BeforeUnloadEvent) => {
      if (!isLeaving.current) event.preventDefault()
    }

    const catchLink = (event: MouseEvent) => {
      const path = toInternalLink(event)
      if (!path) return
      event.preventDefault()
      ask(() => router.replace(path))
    }

    const catchBack = () => {
      if (isLeaving.current || location.href !== href) return
      history.pushState(history.state, '', href)
      ask(() => {
        if (canGoBack) history.go(-2)
        else router.replace(fallbackHref)
      })
    }

    addEventListener('beforeunload', warn)
    addEventListener('click', catchLink, true)
    addEventListener('popstate', catchBack)
    return () => {
      removeEventListener('beforeunload', warn)
      removeEventListener('click', catchLink, true)
      removeEventListener('popstate', catchBack)
      if (isLeaving.current || location.href !== href) {
        history.scrollRestoration = scrollRestoration
        return
      }
      addEventListener(
        'popstate',
        () => {
          history.scrollRestoration = scrollRestoration
        },
        { once: true },
      )
      history.back()
    }
  }, [fallbackHref, isActive, router])

  return {
    isOpen: pendingLeave !== null,
    stay: () => setPendingLeave(null),
    leave: () => {
      isLeaving.current = true
      setPendingLeave(null)
      pendingLeave?.()
    },
  }
}
