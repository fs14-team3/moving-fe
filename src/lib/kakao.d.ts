type KakaoShareLink = {
  mobileWebUrl: string
  webUrl: string
}

export interface KakaoShareSettings {
  objectType: 'feed'
  content: {
    title: string
    description?: string
    imageUrl: string
    imageWidth?: number
    imageHeight?: number
    link: KakaoShareLink
  }
  buttons?: {
    title: string
    link: KakaoShareLink
  }[]
}

type KakaoSdk = {
  init: (key: string) => void
  isInitialized: () => boolean
  Share: {
    sendDefault: (settings: KakaoShareSettings) => void
  }
}

declare global {
  interface Window {
    Kakao?: KakaoSdk
  }
}

export {}
