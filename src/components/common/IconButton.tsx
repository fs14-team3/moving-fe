import Image from 'next/image'
import type { ButtonHTMLAttributes } from 'react'

type Icon = 'like' | 'link' | 'kakao' | 'facebook'

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  icon: Icon
}

// 이미지에 배경·라운드·테두리가 포함되어 있어 버튼은 크기만 정한다.
const ICON: Record<Icon, { src: string; label: string }> = {
  like: { src: '/assets/icon-blackheart.png', label: '좋아요' },
  link: { src: '/assets/icon-share.png', label: '링크 복사' },
  kakao: { src: '/assets/icon-kakao.png', label: '카카오톡 공유' },
  facebook: { src: '/assets/icon-facebook.png', label: '페이스북 공유' },
}

// 모바일 40px / 태블릿 54px / 데스크톱 64px
const SIZE = 'size-10 md:size-[54px] lg:size-16'

export default function IconButton({
  icon,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  ...rest
}: IconButtonProps) {
  const { src, label } = ICON[icon]

  return (
    <button
      type={type}
      aria-label={ariaLabel ?? label}
      className={`relative shrink-0 rounded-2xl transition-opacity hover:opacity-80 disabled:opacity-40 ${SIZE} ${className}`}
      {...rest}
    >
      <Image src={src} alt="" fill sizes="64px" />
    </button>
  )
}
