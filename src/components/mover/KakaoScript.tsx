'use client'

import Script from 'next/script'

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js'

export default function KakaoScript() {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY

  function initializeKakao() {
    if (!kakaoKey) return null

    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey)
    }
  }

  return <Script id="kakao-sdk" src={KAKAO_SDK_URL} onReady={initializeKakao} />
}
