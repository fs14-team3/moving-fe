export async function copyCurrentLink() {
  await navigator.clipboard.writeText(window.location.href)
}

function toAbsoluteImageUrl(imageUrl: string) {
  return imageUrl.startsWith('http')
    ? imageUrl
    : `${window.location.origin}${imageUrl}`
}

export function shareToKakao({
  title,
  description,
  imageUrl,
  buttonTitle,
}: {
  title: string
  description: string
  imageUrl: string
  buttonTitle: string
}) {
  const Kakao = window.Kakao
  if (!Kakao?.isInitialized()) return

  const currentUrl = window.location.href

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      imageUrl: toAbsoluteImageUrl(imageUrl),
      link: {
        mobileWebUrl: currentUrl,
        webUrl: currentUrl,
      },
    },
    buttons: [
      {
        title: buttonTitle,
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
    ],
  })

  return true
}

export function shareToFacebook() {
  const shareUrl = encodeURIComponent(window.location.href)

  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    '_blank',
    'noopener,noreferrer,width=600,height=400',
  )
}
