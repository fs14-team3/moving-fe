import LandingImage from '@/components/landing/LandingImage'
import Image from 'next/image'

export default function Home() {
  return (
    <div>
      <section>
        <LandingImage name="img1" />
        <div>
          <h1>이사업체, 어떻게 고르세요?</h1>
          <p>
            무빙은 여러 견적을 한눈에 비교해
            <br />
            이사업체 선정 과정을 간편하게 바꿔드려요
          </p>
        </div>
      </section>

      <section>
        <h2>
          번거로운 선정과정,
          <br />
          이사 유형부터 선택해요
        </h2>
        <LandingImage name="img2" />
      </section>

      <section>
        <LandingImage name="img3" />
        <h2>
          원하는 이사 서비스를 요청하고
          <br />
          견적을 받아보세요
        </h2>
      </section>

      <section>
        <LandingImage name="img4" />
        <h2>
          여러 업체의 견적을
          <br />
          한눈에 비교하고 선택해요
        </h2>
      </section>

      <section>
        <Image src="/assets/landing/logo.png" width={592} height={540} alt="" />
        <p>
          복잡한 이사 준비,
          <br />
          무빙 하나면 끝!
        </p>
      </section>
    </div>
  )
}
