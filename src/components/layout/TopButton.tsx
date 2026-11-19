'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function TopButton() {
  const [showButton, setShowButton] = useState(false)

  function scrollToTop() {
    window.scroll({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 400) {
        setShowButton(true)
      } else {
        setShowButton(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    showButton && (
      <button
        type="button"
        aria-label="페이지 상단으로 이동"
        onClick={scrollToTop}
        className="fixed right-6 bottom-6 z-40 flex size-10 cursor-pointer items-center justify-center rounded-full border border-line-200 bg-white text-black-400 shadow-sm hover:bg-gray-100"
      >
        <ChevronUp aria-hidden className="size-5" />
      </button>
    )
  )
}
