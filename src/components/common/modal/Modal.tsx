'use client'

import { Building2, FileText, House, MoveRight, Package, X } from 'lucide-react'
import Image from 'next/image'
import {
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type ReactNode,
} from 'react'
import Chip from '@/components/common/Chip'
import Button from '@/components/common/button/Button'
import { cn } from '@/lib/cn'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  // false면 모바일에서도 바텀시트 대신 가운데 모달로 보여준다.
  mobileSheet?: boolean
  className?: string
}

// dialog의 padding은 0으로 두고 안쪽 div에 준다. dialog 자체를 클릭했다면 배경을 누른 것이다.
// 태블릿 이상은 모두 가운데 608px 모달이다.
const BASE =
  'max-h-[90dvh] max-w-none overflow-y-auto bg-white p-0 text-black-400 backdrop:bg-black/50 md:m-auto md:w-152 md:rounded-4xl'

// 모바일: 화면 아래에 붙는 바텀시트 / 가운데 293px 모달
const LAYOUT = {
  sheet: 'mx-0 mt-auto mb-0 w-full rounded-t-3xl',
  center: 'm-auto w-[293px] rounded-3xl',
}

const PADDING = {
  sheet: 'px-6 py-8 md:pb-10',
  center: 'px-4 py-6 md:px-6 md:pt-8 md:pb-10',
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  mobileSheet = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const layout = mobileSheet ? 'sheet' : 'center'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // 모달이 열려 있는 동안 뒤 페이지가 스크롤되지 않게 막는다.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // ESC를 누르면 브라우저가 dialog를 직접 닫기 때문에, 막고 open 상태를 부모가 바꾸게 한다.
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className={cn(BASE, LAYOUT[layout], className)}
    >
      {/* 닫혀 있을 때는 내용을 그리지 않아서, 다시 열면 입력값이 처음 상태로 돌아간다. */}
      {open && (
        <div className={PADDING[layout]}>
          <div className="mb-6 flex items-center justify-between md:mb-10">
            <h2 id={titleId} className="text-lg font-bold md:text-2xl">
              {title}
            </h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="text-gray-400"
            >
              <X strokeWidth={1.5} className="size-6 md:size-9" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

type ModalFieldProps = {
  label: string
  // 입력창 하나에 붙는 라벨이면 htmlFor, 별점처럼 묶음에 붙으면 labelId로 연결한다.
  htmlFor?: string
  labelId?: string
  children: ReactNode
}

// 모달 안의 입력 항목. 위 요소와의 간격까지 포함한다.
export function ModalField({
  label,
  htmlFor,
  labelId,
  children,
}: ModalFieldProps) {
  return (
    <div className="mt-6 flex flex-col gap-4 md:mt-8">
      <label
        id={labelId}
        htmlFor={htmlFor}
        className="text-base font-semibold md:text-lg"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

// 모달 맨 아래의 주요 버튼. 모달 너비를 꽉 채운다.
export function ModalButton(props: ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={cn(
        'mt-8 w-full md:mt-10 md:h-15 lg:w-full lg:text-base',
        props.className,
      )}
    />
  )
}

// 견적 보내기·반려요청·리뷰 쓰기 모달 위쪽의 요청 정보 묶음
export type MoveType = 'small' | 'home' | 'office'

export type RequestSummaryProps = {
  moveType: MoveType
  isDesignated?: boolean
  // '김인서 고객님', '김코드 기사님'처럼 호칭까지 포함한 이름
  name: string
  // 기사님 정보를 보여줄 때 넘긴다. 이름 위에 기사님 표시, 오른쪽에 프로필 이미지가 붙는다.
  moverProfileImage?: string
  from: string
  to: string
  // 화면에 그대로 보여줄 날짜 문자열 (예: '2024년 07월 01일 (월)')
  movingDate: string
}

const ICON = 'size-3.5 md:size-4'

const MOVE_TYPE: Record<MoveType, { label: string; icon: ReactNode }> = {
  small: { label: '소형이사', icon: <Package className={ICON} /> },
  home: { label: '가정이사', icon: <House className={ICON} /> },
  office: { label: '사무실이사', icon: <Building2 className={ICON} /> },
}

const NAME = 'text-base font-semibold md:text-xl'

// 고객님 요청: 모바일은 출발지·도착지 / 이사일 두 줄, 태블릿 이상은 한 줄
// 기사님 정보: 모바일에서도 한 줄
const INFO_LIST = {
  customer:
    'mt-8 flex flex-col gap-2 md:mt-6 md:flex-row md:items-end md:gap-12',
  mover: 'mt-4 flex items-end gap-6 md:gap-12',
}

// stacked면 라벨을 값 위에 둔다. 아니면 모바일에서만 라벨과 값을 한 줄에 둔다.
// stacked일 때는 모바일에서도 세 항목이 한 줄에 들어가야 해서 값 글씨를 한 단계 작게 둔다.
function InfoItem({
  label,
  value,
  stacked,
}: {
  label: string
  value: string
  stacked: boolean
}) {
  return (
    <div
      className={cn(
        'flex',
        stacked
          ? 'flex-col gap-1'
          : 'items-center gap-2 md:flex-col md:items-start md:gap-1',
      )}
    >
      <dt className="text-xs text-gray-500 md:text-sm">{label}</dt>
      <dd
        className={cn(
          'font-semibold md:text-base',
          stacked ? 'text-xs' : 'text-sm',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function RequestSummary({
  moveType,
  isDesignated = false,
  name,
  moverProfileImage,
  from,
  to,
  movingDate,
}: RequestSummaryProps) {
  const { label, icon } = MOVE_TYPE[moveType]
  const isMover = moverProfileImage !== undefined

  return (
    <section className="border-b border-line-100 pb-5 md:pb-6">
      <div className="flex flex-wrap gap-2">
        <Chip icon={icon}>{label}</Chip>
        {isDesignated && (
          <Chip icon={<FileText className={ICON} />}>지정 견적 요청</Chip>
        )}
      </div>

      {isMover ? (
        <div className="mt-4 flex items-end justify-between gap-4 border-b border-line-100 pb-3 md:mt-6">
          <div>
            <Image
              src="/assets/logo-symbol.svg"
              alt=""
              width={16}
              height={17}
              className="h-4 w-auto"
            />
            <p className={cn(NAME, 'mt-1')}>{name}</p>
          </div>
          <Image
            src={moverProfileImage}
            alt=""
            width={56}
            height={56}
            className="size-12 shrink-0 rounded-xl object-cover md:size-14"
          />
        </div>
      ) : (
        <p className={cn(NAME, 'mt-4 md:mt-6')}>{name}</p>
      )}

      <dl className={INFO_LIST[isMover ? 'mover' : 'customer']}>
        <div className="flex items-end gap-2">
          <InfoItem label="출발지" value={from} stacked={isMover} />
          <MoveRight
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-gray-500 md:mb-1',
              !isMover && 'mb-0.5',
            )}
          />
          <InfoItem label="도착지" value={to} stacked={isMover} />
        </div>
        <InfoItem label="이사일" value={movingDate} stacked={isMover} />
      </dl>
    </section>
  )
}
