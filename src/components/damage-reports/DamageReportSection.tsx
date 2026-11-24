'use client'

import { useId, useState } from 'react'
import {
  LoadError,
  Loading,
  RefetchError,
} from '@/components/my-quotes/PageState'
import PhotoThumbnail, {
  PHOTO_GRID,
} from '@/components/proof-photos/PhotoThumbnail'
import ProofPhotoViewer from '@/components/proof-photos/ProofPhotoViewer'
import { useDamageReports } from '@/features/damage-reports/hooks/useDamageReports'
import { formatRequestDate } from '@/features/my-quotes/format'
import { cn } from '@/lib/cn'

type DamageReportSectionProps = {
  quoteId: string
  emptyMessage: string
  className?: string
}

export default function DamageReportSection({
  quoteId,
  emptyMessage,
  className,
}: DamageReportSectionProps) {
  const headingId = useId()
  const [viewing, setViewing] = useState<{
    reportId: string
    index: number
  } | null>(null)
  const {
    reports,
    isPending,
    isLoadingError,
    isRefetchError,
    refetch,
    isRefetching,
  } = useDamageReports(quoteId)
  const viewed = reports.find(({ id }) => id === viewing?.reportId)

  function renderBody() {
    if (isPending) {
      return <Loading label="파손 접수 내역을 불러오고 있습니다." />
    }

    if (isLoadingError) {
      return (
        <LoadError
          message="파손 접수 내역을 불러오지 못했습니다."
          isRetrying={isRefetching}
          onRetry={() => refetch()}
        />
      )
    }

    if (reports.length === 0) {
      return <p className="text-base leading-6 text-gray-400">{emptyMessage}</p>
    }

    return (
      <ul className="flex flex-col gap-3 md:gap-4">
        {reports.map((report) => (
          <li
            key={report.id}
            className="rounded-2xl border border-line-100 p-4 md:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base leading-6 font-semibold wrap-anywhere md:text-lg">
                {report.itemName}
              </h3>
              <p className="shrink-0 text-sm leading-6 text-gray-400">
                접수일 {formatRequestDate(report.createdAt)}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 wrap-anywhere whitespace-pre-line text-black-200 md:text-base">
              {report.description}
            </p>
            <ul className={cn(PHOTO_GRID, 'mt-4')}>
              {report.photos.map((photo, index) => (
                <PhotoThumbnail
                  key={photo.url}
                  src={photo.thumbnailUrl}
                  label={`${report.itemName} 파손 사진 ${index + 1} 크게 보기`}
                  onClick={() => setViewing({ reportId: report.id, index })}
                />
              ))}
            </ul>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section
      aria-labelledby={headingId}
      className={cn('py-5 md:py-8', className)}
    >
      <div className="flex items-center gap-2 pb-5 md:pb-8">
        <h2
          id={headingId}
          className="text-base leading-6 font-semibold md:text-xl md:leading-8"
        >
          파손 접수
        </h2>
        {reports.length > 0 && (
          <p className="text-sm font-medium text-gray-400 md:text-base">
            {reports.length}건
          </p>
        )}
      </div>

      {isRefetchError && (
        <RefetchError
          message="파손 접수 내역을 새로 불러오지 못했어요."
          isRetrying={isRefetching}
          onRetry={() => refetch()}
        />
      )}

      {renderBody()}

      <ProofPhotoViewer
        photos={viewed?.photos ?? []}
        index={viewed && viewing ? viewing.index : null}
        label="파손 사진"
        onChange={(index) =>
          setViewing((current) => current && { ...current, index })
        }
        onClose={() => setViewing(null)}
      />
    </section>
  )
}
