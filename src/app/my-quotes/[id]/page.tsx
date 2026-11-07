import Button from '@/components/common/button/Button'
import IconButton from '@/components/common/button/IconButton'
import ServiceTypeChip from '@/components/mover/ServiceTypeChip'
import { MOCK_QUOTE_DETAIL } from '@/features/my-quotes/fixtures/quotes'
import { Heart, Star } from 'lucide-react'
import Image from 'next/image'

export default function QuoteDetail() {
  // TODO: API 연동 시 삭제
  const quote = MOCK_QUOTE_DETAIL

  return (
    <div>
      <header>
        <h1>견적 상세</h1>
      </header>

      <div>
        <div
          aria-hidden="true"
          className="h-[122px] w-full bg-[url('/assets/images/mover_detail_banner.png')] bg-cover bg-center bg-no-repeat md:h-[157px] lg:h-[225px]"
        />
        <Image
          src={quote.mover.imageUrl ?? '/assets/images/profile.png'}
          width={64}
          height={64}
          alt={`${quote.mover.nickname} 기사님 프로필`}
        />
      </div>

      <article>
        <header>
          <div>
            {quote.mover.serviceTypes?.map((serviceType) => (
              <ServiceTypeChip serviceType={serviceType} key={serviceType} />
            ))}
            <p>{quote.mover.intro}</p>
          </div>
          <p>{quote.status}</p>
        </header>

        <div>
          <div>
            <div>
              <Image
                src="/assets/icons/mover_badge.png"
                width={20}
                height={23}
                alt=""
              />
              <p>{quote.mover.nickname} 기사님</p>
            </div>

            <dl>
              <div>
                <Star aria-hidden="true" />
                <dd>
                  {quote.mover.averageRating}{' '}
                  <span>({quote.mover.reviewCount})</span>
                </dd>
              </div>
              <div>
                <dt>경력</dt>
                <dd>{quote.mover.careerYears}년</dd>
              </div>
              <div>
                <dd>{quote.mover.confirmedCount}건</dd>
                <dt>확정</dt>
              </div>
            </dl>
          </div>

          <button type="button">
            <span>{quote.mover.favoriteCount}</span>
            <Heart aria-hidden="true" />
          </button>
        </div>

        <section>
          <h2>견적가</h2>
          <p>{quote.price}</p>
        </section>

        <section>
          <h2>견적 정보</h2>
          <dl>
            <div>
              <dt>견적 요청일</dt>
              <dd>{quote.moveRequest.createdAt}</dd>
            </div>
            <div>
              <dt>서비스</dt>
              <dd>{quote.moveRequest.moveType}</dd>
            </div>
            <div>
              <dt>이용일</dt>
              <dd>{quote.moveRequest.moveDate}</dd>
            </div>
            <div>
              <dt>출발지</dt>
              <dd>{quote.moveRequest.from.address}</dd>
            </div>
            <div>
              <dt>도착지</dt>
              <dd>{quote.moveRequest.to.address}</dd>
            </div>
          </dl>
        </section>
      </article>

      <aside>
        <section>
          {/* status에 따라 보여줄지 말지 분기 */}
          <p>견적가</p>
          <p>{quote.price}</p>
          <Button>견적 확정하기</Button>
        </section>

        <section>
          <h2>견적서 공유하기</h2>
          <IconButton icon="link" className="cursor-pointer" />
          <IconButton icon="kakao" className="cursor-pointer" />
          <IconButton icon="facebook" className="cursor-pointer" />
        </section>
      </aside>
    </div>
  )
}
