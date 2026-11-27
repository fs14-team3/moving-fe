import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import DamageReportForm from '@/components/damage-reports/DamageReportForm'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { useCreateDamageReport } from '@/features/damage-reports/hooks/useCreateDamageReport'
import { useDamagePhotoUploads } from '@/features/damage-reports/hooks/useDamagePhotoUploads'
import type { PhotoUpload } from '@/features/proof-photos/hooks/usePhotoUploads'
import { useLeaveGuard } from '@/hooks/useLeaveGuard'
import { ApiError } from '@/lib/api-error'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

const toast = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/damage-reports/hooks/useDamagePhotoUploads', () => ({
  useDamagePhotoUploads: vi.fn(),
}))

vi.mock(
  '@/features/damage-reports/hooks/useCreateDamageReport',
  async (importOriginal) => ({
    ...(await importOriginal()),
    useCreateDamageReport: vi.fn(),
  }),
)

vi.mock('@/hooks/useLeaveGuard', () => ({
  useLeaveGuard: vi.fn(),
}))

const uploadState = {
  uploads: [] as PhotoUpload[],
  isUploading: false,
  failed: [] as PhotoUpload[],
  start: vi.fn(),
  retry: vi.fn(),
  remove: vi.fn(),
  expire: vi.fn(),
}

const leaveGuard = { isOpen: false, stay: vi.fn(), leave: vi.fn() }

const creation = { mutate: vi.fn(), isPending: false }

const onClose = vi.fn()

function photoFiles(count: number) {
  return Array.from(
    { length: count },
    (_, i) => new File(['x'], `${i}.jpg`, { type: 'image/jpeg' }),
  )
}

function upload(id: number, patch: Partial<PhotoUpload> = {}): PhotoUpload {
  return {
    id,
    file: photoFiles(1)[0],
    status: 'uploaded',
    progress: 100,
    uploadId: `upload-${id}`,
    ...patch,
  }
}

function mockUploads(uploads: PhotoUpload[], isUploading = false) {
  vi.mocked(useDamagePhotoUploads).mockReturnValue({
    ...uploadState,
    uploads,
    isUploading,
    failed: uploads.filter(({ status }) => status === 'failed'),
  })
}

function mockCreation(state: Partial<typeof creation> = {}) {
  vi.mocked(useCreateDamageReport).mockReturnValue({
    ...creation,
    ...state,
  } as unknown as ReturnType<typeof useCreateDamageReport>)
}

function renderForm() {
  return render(<DamageReportForm quoteId="quote-1" onClose={onClose} />)
}

function submitButton() {
  return screen.getByRole('button', { name: '접수하기' })
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('파손된 품목'), ' 4인용 식탁 ')
  await user.type(screen.getByLabelText('상세 내용'), '상판이 깨졌어요. ')
}

describe('DamageReportForm', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockUploads([])
    mockCreation()
    vi.mocked(useLeaveGuard).mockReturnValue({ ...leaveGuard })
  })

  it('품목명과 상세 내용을 입력하고 사진을 1장 이상 올려야 접수할 수 있다', async () => {
    const user = userEvent.setup()
    const { rerender } = renderForm()

    expect(useDamagePhotoUploads).toHaveBeenCalledWith('quote-1')
    expect(submitButton()).toBeDisabled()
    expect(
      screen.getByText('파손된 부분이 보이는 사진을 1장 이상 올려 주세요.'),
    ).toBeInTheDocument()

    await fill(user)

    expect(submitButton()).toBeDisabled()

    mockUploads([upload(0)])
    rerender(<DamageReportForm quoteId="quote-1" onClose={onClose} />)

    expect(submitButton()).toBeEnabled()
    expect(screen.getByText('1/10')).toBeInTheDocument()
  })

  it.each([
    ['품목명', '상세 내용'],
    ['상세 내용', '파손된 품목'],
  ])('%s이 공백뿐이면 접수할 수 없다', async (_, filled) => {
    const user = userEvent.setup()
    mockUploads([upload(0)])
    renderForm()

    await user.type(screen.getByLabelText(filled), '내용')
    await user.type(
      screen.getByLabelText(
        filled === '상세 내용' ? '파손된 품목' : '상세 내용',
      ),
      '   ',
    )

    expect(submitButton()).toBeDisabled()
  })

  it.each([
    ['올리는 중인 사진이 있으면', upload(1, { status: 'uploading' }), true],
    [
      '올리지 못한 사진이 있으면',
      upload(1, { status: 'failed', error: '올리지 못했어요' }),
      false,
    ],
  ])('%s 접수할 수 없다', async (_, pending, isUploading) => {
    const user = userEvent.setup()
    mockUploads([upload(0), pending], isUploading)
    renderForm()

    await fill(user)

    expect(submitButton()).toBeDisabled()
  })

  it('입력한 글자 수와 최대 글자 수를 보여주고 최대 글자 수까지만 입력받는다', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('파손된 품목'), '책장')

    expect(screen.getByText('2 / 50자')).toBeInTheDocument()
    expect(screen.getByText('0 / 500자')).toBeInTheDocument()
    expect(screen.getByLabelText('파손된 품목')).toHaveAttribute(
      'maxlength',
      '50',
    )
    expect(screen.getByLabelText('상세 내용')).toHaveAttribute(
      'maxlength',
      '500',
    )
  })

  it('사진을 고르면 바로 올리기 시작한다', async () => {
    const user = userEvent.setup()
    const { container } = renderForm()
    const files = photoFiles(3)

    await user.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      files,
    )

    expect(uploadState.start).toHaveBeenCalledWith(files)
  })

  it('남은 장수보다 많이 고르면 올리지 않고 남은 장수를 알린다', async () => {
    const user = userEvent.setup()
    mockUploads(Array.from({ length: 8 }, (_, id) => upload(id)))
    const { container } = renderForm()

    await user.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      photoFiles(3),
    )

    expect(uploadState.start).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(
      TOAST_MESSAGES.damageReport.tooManyPhotos(2),
    )
  })

  it('사진이 10장이면 더 추가할 수 없다', () => {
    mockUploads(Array.from({ length: 10 }, (_, id) => upload(id)))

    renderForm()

    expect(screen.getByRole('button', { name: '사진 추가' })).toBeDisabled()
    expect(screen.getByText('10/10')).toBeInTheDocument()
  })

  it('올리는 사진의 진행률과 올리는 장수를 보여준다', () => {
    mockUploads(
      [upload(0), upload(1, { status: 'uploading', progress: 40 })],
      true,
    )

    renderForm()

    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('1장을 올리고 있어요.')).toBeInTheDocument()
  })

  it('올리지 못한 사진은 한 장씩 또는 모두 다시 시도할 수 있다', async () => {
    const user = userEvent.setup()
    const failed = upload(1, {
      status: 'failed',
      error: '올리지 못했어요',
      retryable: true,
    })
    mockUploads([upload(0), failed])
    renderForm()

    expect(screen.getByText('1장을 올리지 못했어요.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    await user.click(screen.getByRole('button', { name: '모두 다시 시도' }))

    expect(uploadState.retry).toHaveBeenNthCalledWith(1, [failed])
    expect(uploadState.retry).toHaveBeenNthCalledWith(2, [failed])
  })

  it('올린 사진을 목록에서 뺄 수 있다', async () => {
    const user = userEvent.setup()
    mockUploads([upload(0), upload(1)])
    renderForm()

    const tiles = within(
      screen.getByRole('list', { name: /사진/ }),
    ).getAllByRole('listitem')
    await user.click(
      within(tiles[1]).getByRole('button', { name: '목록에서 빼기' }),
    )

    expect(uploadState.remove).toHaveBeenCalledWith(1)
  })

  it('접수하면 앞뒤 공백을 뺀 내용과 올린 사진을 순서대로 보내고 성공하면 닫는다', async () => {
    const user = userEvent.setup()
    mockUploads([upload(3), upload(1)])
    renderForm()
    await fill(user)

    await user.click(submitButton())

    expect(creation.mutate).toHaveBeenCalledWith(
      {
        itemName: '4인용 식탁',
        description: '상판이 깨졌어요.',
        uploadIds: ['upload-3', 'upload-1'],
      },
      expect.any(Object),
    )
    expect(onClose).not.toHaveBeenCalled()

    creation.mutate.mock.calls[0][1].onSuccess()

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('올린 사진이 만료되어 접수하지 못하면 사진을 다시 올리게 한다', async () => {
    const user = userEvent.setup()
    mockUploads([upload(0)])
    renderForm()
    await fill(user)
    await user.click(submitButton())
    const { onError } = creation.mutate.mock.calls[0][1]

    onError(new ApiError('DAMAGE_REPORT_NOT_ALLOWED', 'Conflict', 409))

    expect(uploadState.expire).not.toHaveBeenCalled()

    onError(new ApiError('DAMAGE_PHOTO_NOT_UPLOADED', 'Conflict', 409))

    expect(uploadState.expire).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('접수하는 동안에는 내용을 바꾸거나 사진을 삭제하거나 다시 접수할 수 없다', async () => {
    const user = userEvent.setup()
    mockUploads([upload(0)])
    const { rerender } = renderForm()
    await fill(user)
    await user.click(submitButton())
    mockCreation({ isPending: true })
    rerender(<DamageReportForm quoteId="quote-1" onClose={onClose} />)

    const description = screen.getByLabelText('상세 내용')
    const removePhoto = screen.getByRole('button', { name: '목록에서 빼기' })
    expect(screen.getByLabelText('파손된 품목')).toBeDisabled()
    expect(description).toBeDisabled()
    expect(removePhoto).toBeDisabled()
    await user.type(description, '추가 내용')
    await user.click(removePhoto)
    expect(description).toHaveValue('상판이 깨졌어요. ')
    expect(uploadState.remove).not.toHaveBeenCalled()

    expect(submitButton()).toBeDisabled()
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '사진 추가' })).toBeDisabled()
  })

  it('취소하면 접수하지 않고 닫는다', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(onClose).toHaveBeenCalledOnce()
    expect(creation.mutate).not.toHaveBeenCalled()
  })

  it('입력한 내용이나 사진이 있으면 페이지를 떠나기 전에 확인한다', async () => {
    const user = userEvent.setup()
    const { rerender } = renderForm()

    expect(useLeaveGuard).toHaveBeenLastCalledWith(false, '/my-quotes')

    await user.type(screen.getByLabelText('상세 내용'), '긁')

    expect(useLeaveGuard).toHaveBeenLastCalledWith(true, '/my-quotes')

    await user.clear(screen.getByLabelText('상세 내용'))

    expect(useLeaveGuard).toHaveBeenLastCalledWith(false, '/my-quotes')

    mockUploads([upload(0, { status: 'uploading' })], true)
    rerender(<DamageReportForm quoteId="quote-1" onClose={onClose} />)

    expect(useLeaveGuard).toHaveBeenLastCalledWith(true, '/my-quotes')
  })

  it('떠나기 전 확인 창에서 머무르거나 나갈 수 있다', async () => {
    const user = userEvent.setup()
    vi.mocked(useLeaveGuard).mockReturnValue({ ...leaveGuard, isOpen: true })
    renderForm()

    const dialog = screen.getByRole('dialog', { name: '페이지를 나갈까요?' })
    expect(dialog).toHaveTextContent('아직 접수하지 않은 내용이 있어요.')

    await user.click(within(dialog).getByRole('button', { name: '취소' }))
    await user.click(within(dialog).getByRole('button', { name: '나가기' }))

    expect(leaveGuard.stay).toHaveBeenCalledOnce()
    expect(leaveGuard.leave).toHaveBeenCalledOnce()
  })
})
