import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import SocialLogin from '@/components/auth/SocialLogin'
import { takeSocialLoginState } from '@/features/auth/lib/social'
import type { Role } from '@/features/auth/types'

function preventNavigation(event: MouseEvent) {
  event.preventDefault()
}

describe('SocialLogin', () => {
  beforeEach(() => {
    sessionStorage.clear()
    document.addEventListener('click', preventNavigation)
  })

  afterEach(() => {
    document.removeEventListener('click', preventNavigation)
  })

  it.each<Role>(['CUSTOMER', 'MOVER'])(
    '%s 유저 타입으로 각 소셜 로그인을 시작한다',
    (role) => {
      render(<SocialLogin role={role} />)

      for (const [name, provider] of [
        ['구글로 로그인', 'google'],
        ['카카오로 로그인', 'kakao'],
        ['네이버로 로그인', 'naver'],
      ]) {
        expect(screen.getByRole('link', { name })).toHaveAttribute(
          'href',
          `/auth/${provider}?role=${role}`,
        )
      }
    },
  )

  it('이동하기 전에 유저 타입과 로그인 후 돌아갈 주소를 기억한다', () => {
    window.history.replaceState(null, '', '/mover/login?redirect=%2Fmover')
    render(<SocialLogin role="MOVER" />)

    fireEvent.click(screen.getByRole('link', { name: '카카오로 로그인' }))

    expect(takeSocialLoginState()).toEqual({
      role: 'MOVER',
      redirect: '/mover',
    })
  })
})
