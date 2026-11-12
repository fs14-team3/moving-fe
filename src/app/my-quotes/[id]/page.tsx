'use client'

import Button from '@/components/common/button/Button'
import IconButton from '@/components/common/button/IconButton'
import { MOVE_TYPE } from '@/components/common/modal/Modal'
import { LoadError, Loading } from '@/components/my-quotes/PageState'
import QuoteBadges from '@/components/my-quotes/QuoteBadges'
import {
  ConfirmedLabel,
  QuoteDetailHeader,
  QuoteInfo,
  QuotePrice,
} from '@/components/quotes/QuoteDetail'
import KakaoScript from '@/components/share/KakaoScript'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useAddFavorite } from '@/features/favorites/hooks/useAddFavorite'
import { useRemoveFavorite } from '@/features/favorites/hooks/useRemoveFavorite'
import { useConfirmQuote } from '@/features/my-quotes/hooks/useConfirmQuote'
import { useQuoteDetail } from '@/features/my-quotes/hooks/useQuoteDetail'
import { useQuoteNotFound } from '@/features/my-quotes/hooks/useQuoteNotFound'
import { formatMoveDate } from '@/features/received-requests/format'
import {
  copyCurrentLink,
  shareToFacebook,
  shareToKakao,
} from '@/features/share/utils'
import { cn } from '@/lib/cn'
import { Heart, Star } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

export default function QuoteDetail() {
  // 라우팅 및 API 상태
  const { id } = useParams<{ id: string }>()

  const { user, isPending: isUserPending } = useCurrentUser()

  const { quote, error, isPending, isError, refetch, isRefetching } =
    useQuoteDetail(id)

  const { mutate: addFavorite, isPending: isAddingFavorite } = useAddFavorite(
    quote?.mover.id ?? '',
  )

  const { mutate: removeFavorite, isPending: isRemovingFavorite } =
    useRemoveFavorite(quote?.mover.id ?? '')

  const { mutate: confirmQuote, isPending: isConfirming } = useConfirmQuote()
  const isNotFound = useQuoteNotFound(error, '/my-quotes')

  const isFavoritePending = isAddingFavorite || isRemovingFavorite
  const isFavoriteDisabled = isUserPending || isFavoritePending

  // 비동기 상태 처리
  if (isPending) {
    return <Loading fullPage label="견적 정보를 불러오고 있습니다." />
  }

  if (isNotFound) return null

  if (isError && !quote) {
    return (
      <LoadError
        fullPage
        message="견적 정보를 불러오지 못했습니다."
        isRetrying={isRefetching}
        onRetry={() => refetch()}
      />
    )
  }

  if (!quote) return null

  // 화면 표시 데이터
  const isQuotePending =
    quote.status === 'SUBMITTED' && quote.moveRequest.status === 'PENDING'
  const { mover } = quote
  const imageUrl = mover.imageUrl ?? '/assets/images/profile.png'
  const intro = mover.intro?.trim() || '등록된 소개가 없습니다.'
  const nickname = mover.nickname?.trim() || '익명'
  const careerYears =
    mover.careerYears !== null ? `${mover.careerYears}년` : '-'
  const isFavorite = mover.isFavorite
  const favoriteCount = mover.favoriteCount
  const moveTypeLabel = MOVE_TYPE[quote.moveRequest.moveType].label
  const moveDateLabel = formatMoveDate(quote.moveRequest.moveDate)
  const priceLabel = `${quote.price.toLocaleString()}원`

  // 이벤트 핸들러
  async function handleCopyLink() {
    try {
      await copyCurrentLink()
      toast.success(TOAST_MESSAGES.common.linkCopied)
    } catch {
      toast.error(TOAST_MESSAGES.common.linkCopyFailed)
    }
  }

  function handleKakaoShare() {
    const ok = shareToKakao({
      title: `${nickname} 기사님 | 무빙`,
      description: `${moveTypeLabel} · ${moveDateLabel} · ${priceLabel}`,
      imageUrl,
      buttonTitle: '견적 상세 보기',
    })

    if (!ok) toast.error(TOAST_MESSAGES.common.shareFailed)
  }

  function handleFacebookShare() {
    shareToFacebook()
  }

  function handleFavorite() {
    if (!user) {
      toast.info(TOAST_MESSAGES.favorite.loginRequired)
      return
    }

    if (user.role !== 'CUSTOMER') {
      toast.info(TOAST_MESSAGES.favorite.customerOnly)
      return
    }

    if (!user.hasProfile) {
      toast.info(TOAST_MESSAGES.favorite.profileRequired)
      return
    }

    if (isFavorite) {
      removeFavorite()
      return
    }

    addFavorite()
  }

  return (
    <>
      <KakaoScript />

      <div className="bg-gray-50">
        <QuoteDetailHeader>
          <div className="absolute inset-x-0 top-0 mx-auto h-full max-w-[1354px]">
            <Image
              src={imageUrl}
              width={64}
              height={64}
              alt={`${nickname} 기사님 프로필`}
              className="absolute top-20 left-4 rounded-xl md:top-20 md:left-18 md:size-25 lg:top-[97px] lg:size-[134px]"
            />
          </div>
        </QuoteDetailHeader>

        <div
          className={cn(
            'px-5 pt-[35px] md:px-18 md:pt-[46px] lg:mx-auto lg:grid lg:max-w-[1354px] lg:grid-cols-[minmax(0,766px)_328px] lg:gap-x-35 lg:px-18 lg:pt-[82px] lg:pb-[62px]',
            isQuotePending && 'pb-[110px]',
          )}
        >
          <article>
            <header className="flex flex-col gap-3 border-b border-line-100 pb-3 md:pb-5">
              <div className="flex justify-between">
                <QuoteBadges
                  moveType={quote.moveRequest.moveType}
                  isDesignated={quote.isDesignated}
                />
                {quote.status === 'CONFIRMED' && <ConfirmedLabel />}
                {isQuotePending && (
                  <p className="shrink-0 text-base leading-6 font-semibold text-gray-400">
                    견적대기
                  </p>
                )}
              </div>
              <p className="text-lg leading-6 font-semibold md:text-2xl md:leading-8">
                {intro}
              </p>
            </header>

            <div className="flex items-start justify-between border-b border-line-100 py-3 md:py-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <Image
                    src="/assets/icons/mover_badge.png"
                    width={20}
                    height={23}
                    alt=""
                  />
                  <p className="text-base leading-6 font-semibold md:text-lg">
                    {nickname} 기사님
                  </p>
                </div>

                <dl className="flex items-center gap-2">
                  <div className="flex items-center gap-[2px] text-sm leading-6 font-medium">
                    <Star
                      aria-hidden="true"
                      className="size-5 fill-yellow-400 text-yellow-400"
                    />
                    <dd>
                      {quote.mover.averageRating.toFixed(1)}{' '}
                      <span className="text-gray-400">
                        ({quote.mover.reviewCount})
                      </span>
                    </dd>
                  </div>

                  <div
                    aria-hidden="true"
                    className="h-[14px] w-px bg-line-200"
                  />

                  <div className="flex items-center gap-1 text-sm leading-6 font-medium">
                    <dt className="text-gray-400">경력</dt>
                    <dd>{careerYears}</dd>
                  </div>

                  <div
                    aria-hidden="true"
                    className="h-[14px] w-px bg-line-200"
                  />

                  <div className="flex items-center gap-1 text-sm leading-6 font-medium">
                    <dd>{quote.mover.confirmedCount}건</dd>
                    <dt className="text-gray-400">확정</dt>
                  </div>
                </dl>
              </div>

              <button
                type="button"
                aria-label={isFavorite ? '찜 해제하기' : '찜하기'}
                disabled={isFavoriteDisabled}
                onClick={handleFavorite}
                className="flex cursor-pointer items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-sm leading-6 font-medium text-gray-500 md:text-lg">
                  {favoriteCount}
                </span>
                <Heart
                  aria-hidden="true"
                  className={
                    isFavorite
                      ? 'size-4 fill-red-500 text-red-500'
                      : 'size-4 fill-transparent text-gray-300'
                  }
                />
              </button>
            </div>

            <QuotePrice price={quote.price} />
            <QuoteInfo
              moveRequest={quote.moveRequest}
              className="border-b border-line-100 lg:border-none"
            />
          </article>

          <aside>
            {isQuotePending && (
              <section className="fixed inset-x-0 bottom-0 z-50 bg-gray-50 px-6 py-7 md:px-18 lg:static lg:border-b lg:border-line-100 lg:px-0 lg:pb-10">
                <p className="hidden text-lg leading-6 font-semibold text-gray-400 lg:block">
                  견적가
                </p>
                <p className="hidden text-2xl leading-8 font-bold lg:block">
                  {quote.price.toLocaleString()}원
                </p>
                <Button
                  disabled={isConfirming}
                  onClick={() => confirmQuote(id)}
                  className="w-full cursor-pointer lg:mt-[30px] lg:w-80"
                >
                  견적 확정하기
                </Button>
              </section>
            )}

            <section className="mb-10 flex flex-col gap-3 py-5 md:py-8 md:pb-16 lg:mb-0 lg:gap-5 lg:px-0 lg:pt-10">
              <h2 className="text-base leading-8 font-semibold lg:text-xl">
                견적서 공유하기
              </h2>
              <div className="flex gap-3 lg:gap-4">
                <IconButton
                  icon="link"
                  className="cursor-pointer"
                  onClick={handleCopyLink}
                />
                <IconButton
                  icon="kakao"
                  className="cursor-pointer"
                  onClick={handleKakaoShare}
                />
                <IconButton
                  icon="facebook"
                  className="cursor-pointer"
                  onClick={handleFacebookShare}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  )
}
