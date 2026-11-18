import Link from 'next/link'
import { getLoginPath } from '@/features/auth/lib/paths'

type ChatLoginPageProps = {
  searchParams: Promise<{
    redirect?: string | string[]
  }>
}

export default async function ChatLoginPage({
  searchParams,
}: ChatLoginPageProps) {
  const params = await searchParams
  const redirect =
    typeof params.redirect === 'string' ? params.redirect : '/chats'

  return (
    <section className="flex min-h-page items-center justify-center bg-background-200 px-5 py-12">
      <div className="w-full max-w-120 rounded-3xl border border-line-200 bg-gray-50 px-6 py-10 shadow-sm sm:px-10">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-black-400">
            어떤 계정으로 시작하시겠어요?
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            이용 중인 계정 유형을 선택해 주세요.
            <br />
            로그인 후 이전에 보던 채팅으로 이동합니다.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href={getLoginPath('CUSTOMER', redirect)}
            className="group flex items-center justify-between rounded-2xl border border-line-200 bg-background-100 p-5 transition-colors hover:border-primary-300 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
          >
            <div>
              <p className="mb-1 font-semibold text-black-400">
                고객으로 시작하기
              </p>
              <p className="text-sm text-gray-500">
                이사 견적을 요청하고 채팅하기
              </p>
            </div>
            <span
              aria-hidden="true"
              className="text-xl text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-400"
            >
              →
            </span>
          </Link>

          <Link
            href={getLoginPath('MOVER', redirect)}
            className="group flex items-center justify-between rounded-2xl border border-line-200 bg-background-100 p-5 transition-colors hover:border-primary-300 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
          >
            <div>
              <p className="mb-1 font-semibold text-black-400">
                기사님으로 시작하기
              </p>
              <p className="text-sm text-gray-500">
                받은 이사 요청을 확인하고 채팅하기
              </p>
            </div>
            <span
              aria-hidden="true"
              className="text-xl text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-400"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
