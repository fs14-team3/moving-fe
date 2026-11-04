import { useEffect, type RefObject } from 'react'

type UseDismissOptions = {
  isOpen: boolean
  onDismiss: () => void
  // 이 영역 바깥을 누르면 닫는다. 여는 버튼도 이 안에 있어야 버튼을 눌렀을 때 다시 열리지 않는다.
  containerRef: RefObject<HTMLElement | null>
  // Esc로 닫으면 포커스를 돌려줄 버튼
  triggerRef: RefObject<HTMLElement | null>
}

// 드롭다운처럼 버튼으로 여는 패널을 바깥 클릭이나 Esc로 닫는다.
export function useDismiss({
  isOpen,
  onDismiss,
  containerRef,
  triggerRef,
}: UseDismissOptions) {
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onDismiss()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onDismiss()
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onDismiss, containerRef, triggerRef])
}
