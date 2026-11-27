'use client'

import { useId, useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'
import Button from '@/components/common/button/Button'
import Input from '@/components/common/input/Input'
import TextArea from '@/components/common/input/TextArea'
import ConfirmModal from '@/components/common/modal/ConfirmModal'
import PhotoPickerButton from '@/components/proof-photos/PhotoPickerButton'
import { PHOTO_GRID } from '@/components/proof-photos/PhotoThumbnail'
import UploadStatus from '@/components/proof-photos/UploadStatus'
import UploadTile from '@/components/proof-photos/UploadTile'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  isPhotoExpired,
  useCreateDamageReport,
} from '@/features/damage-reports/hooks/useCreateDamageReport'
import { useDamagePhotoUploads } from '@/features/damage-reports/hooks/useDamagePhotoUploads'
import { useLeaveGuard } from '@/hooks/useLeaveGuard'
import { cn } from '@/lib/cn'

const ITEM_NAME_MAX = 50
const DESCRIPTION_MAX = 500
const MAX_PHOTOS = 10

const LABEL = 'text-base font-semibold md:text-lg'
const FIELD = 'w-full lg:w-full'
const ACTION = 'h-12 w-auto flex-1 lg:h-14 lg:w-auto lg:text-base'

type DamageReportFormProps = {
  quoteId: string
  onClose: () => void
}

export default function DamageReportForm({
  quoteId,
  onClose,
}: DamageReportFormProps) {
  const itemNameId = useId()
  const descriptionId = useId()
  const photosId = useId()
  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const { uploads, isUploading, failed, start, retry, remove, expire } =
    useDamagePhotoUploads(quoteId)
  const { mutate: createReport, isPending: isSubmitting } =
    useCreateDamageReport(quoteId)

  const uploadIds = uploads.flatMap(({ status, uploadId }) =>
    status === 'uploaded' && uploadId ? [uploadId] : [],
  )
  const remaining = MAX_PHOTOS - uploads.length
  const canSubmit =
    itemName.trim() !== '' &&
    description.trim() !== '' &&
    uploadIds.length > 0 &&
    uploadIds.length === uploads.length &&
    !isSubmitting
  const leaveGuard = useLeaveGuard(
    itemName !== '' || description !== '' || uploads.length > 0,
    '/my-quotes',
  )

  function select(files: File[]) {
    if (files.length > remaining) {
      toast.error(TOAST_MESSAGES.damageReport.tooManyPhotos(remaining))
      return
    }
    start(files)
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    createReport(
      {
        itemName: itemName.trim(),
        description: description.trim(),
        uploadIds,
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (isPhotoExpired(error)) expire()
        },
      },
    )
  }

  return (
    <form
      aria-label="파손 접수"
      aria-busy={isSubmitting}
      onSubmit={submit}
      className="mb-5 rounded-2xl border border-line-200 p-4 md:mb-8 md:p-6"
    >
      <fieldset
        disabled={isSubmitting}
        className="flex min-w-0 flex-col gap-5 md:gap-6"
      >
        <div className="flex flex-col gap-2 md:gap-3">
          <label htmlFor={itemNameId} className={LABEL}>
            파손된 품목
          </label>
          <Input
            id={itemNameId}
            placeholder="예: 4인용 식탁"
            maxLength={ITEM_NAME_MAX}
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            charCount={{ count: itemName.length, max: ITEM_NAME_MAX }}
            wrapperClassName={FIELD}
          />
        </div>

        <div className="flex flex-col gap-2 md:gap-3">
          <label htmlFor={descriptionId} className={LABEL}>
            상세 내용
          </label>
          <TextArea
            id={descriptionId}
            placeholder="어디가 어떻게 파손되었는지 적어 주세요"
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            charCount={{ count: description.length, max: DESCRIPTION_MAX }}
            wrapperClassName={FIELD}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 pb-3">
            <p id={photosId} className={cn(LABEL, 'flex items-center gap-2')}>
              사진
              <span className="text-sm font-medium text-gray-400 md:text-base">
                {uploads.length}/{MAX_PHOTOS}
              </span>
            </p>
            <PhotoPickerButton disabled={remaining <= 0} onSelect={select}>
              사진 추가
            </PhotoPickerButton>
          </div>

          <UploadStatus
            uploadingCount={uploads.length - uploadIds.length - failed.length}
            failed={failed}
            onRetry={retry}
          />

          {uploads.length === 0 ? (
            <p className="text-sm leading-6 text-gray-400 md:text-base">
              파손된 부분이 보이는 사진을 1장 이상 올려 주세요.
            </p>
          ) : (
            <ul aria-labelledby={photosId} className={PHOTO_GRID}>
              {uploads.map((upload) => (
                <UploadTile
                  key={upload.id}
                  upload={upload}
                  disabled={isUploading}
                  onRetry={() => retry([upload])}
                  onRemove={() => remove(upload.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2 md:gap-3">
          <Button variant="outlined" done onClick={onClose} className={ACTION}>
            취소
          </Button>
          <Button type="submit" disabled={!canSubmit} className={ACTION}>
            접수하기
          </Button>
        </div>
      </fieldset>

      <ConfirmModal
        open={leaveGuard.isOpen}
        onClose={leaveGuard.stay}
        onConfirm={leaveGuard.leave}
        title="페이지를 나갈까요?"
        confirmLabel="나가기"
      >
        아직 접수하지 않은 내용이 있어요.
        <br />
        나가면 입력한 내용과 사진이 사라져요.
      </ConfirmModal>
    </form>
  )
}
