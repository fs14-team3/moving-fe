import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ProofPhotoSection from '@/components/proof-photos/ProofPhotoSection'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  useProofPhotoUploads,
  type PhotoUpload,
} from '@/features/proof-photos/hooks/useProofPhotoUploads'
import { useProofPhotos } from '@/features/proof-photos/hooks/useProofPhotos'
import { useLeaveGuard } from '@/hooks/useLeaveGuard'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

const toast = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/proof-photos/hooks/useProofPhotos', () => ({
  useProofPhotos: vi.fn(),
}))

vi.mock('@/features/proof-photos/hooks/useProofPhotoUploads', () => ({
  useProofPhotoUploads: vi.fn(),
}))

vi.mock('@/hooks/useLeaveGuard', () => ({
  useLeaveGuard: vi.fn(),
}))

const PHOTOS = ['a', 'b'].map((id) => ({
  id,
  url: `https://img/${id}`,
  thumbnailUrl: `https://img/${id}-thumbnail`,
  createdAt: '2026-11-16T00:00:00.000Z',
}))

const uploads = {
  uploads: [] as PhotoUpload[],
  isUploading: false,
  failed: [] as PhotoUpload[],
  start: vi.fn(),
  retry: vi.fn(),
  remove: vi.fn(),
}

const leaveGuard = { isOpen: false, stay: vi.fn(), leave: vi.fn() }

function mockPhotos(
  photos = PHOTOS,
  maxCount = 100,
  state: Partial<ReturnType<typeof useProofPhotos>> = {},
) {
  vi.mocked(useProofPhotos).mockReturnValue({
    photos,
    maxCount,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    refetch: vi.fn(),
    isRefetching: false,
    ...state,
  } as unknown as ReturnType<typeof useProofPhotos>)
}

function failedUpload(): PhotoUpload {
  return {
    id: 0,
    file: photoFiles(1)[0],
    status: 'failed',
    progress: 0,
    error: '올리지 못했어요',
    retryable: true,
  }
}

function photoFiles(count: number) {
  return Array.from(
    { length: count },
    (_, i) => new File(['x'], `${i}.jpg`, { type: 'image/jpeg' }),
  )
}

function fileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement
}

describe('ProofPhotoSection', () => {
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
    mockPhotos()
    vi.mocked(useProofPhotoUploads).mockReturnValue({ ...uploads })
    vi.mocked(useLeaveGuard).mockReturnValue({ ...leaveGuard })
  })

  it('올라온 작업 사진과 장수를 보여준다', () => {
    render(<ProofPhotoSection quoteId="quote-1" emptyMessage="없음" />)

    expect(useProofPhotos).toHaveBeenCalledWith('quote-1')
    expect(screen.getByText('2/100')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /크게 보기$/ })).toHaveLength(
      2,
    )
    expect(
      screen.queryByRole('button', { name: '사진 올리기' }),
    ).not.toBeInTheDocument()
  })

  it('사진이 없으면 안내 문구를 보여준다', () => {
    mockPhotos([])

    render(<ProofPhotoSection quoteId="quote-1" emptyMessage="사진 없음" />)

    expect(screen.getByText('사진 없음')).toBeInTheDocument()
  })

  it('사진을 고르면 한 번 더 확인한 뒤 올리기 시작한다', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )
    const files = photoFiles(3)

    await user.upload(fileInput(container), files)

    const dialog = screen.getByRole('dialog', { name: '작업 사진 올리기' })
    expect(dialog).toHaveTextContent('3장을 올릴까요?')
    expect(dialog).toHaveTextContent('올린 사진은 삭제할 수 없어요.')

    await user.click(within(dialog).getByRole('button', { name: '올리기' }))

    expect(uploads.start).toHaveBeenCalledWith(files)
  })

  it('남은 장수보다 많이 고르면 올리지 않고 알린다', async () => {
    mockPhotos(PHOTOS, 4)
    const user = userEvent.setup()
    const { container } = render(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )

    await user.upload(fileInput(container), photoFiles(3))

    expect(toast.error).toHaveBeenCalledWith(
      TOAST_MESSAGES.proofPhoto.tooMany(2),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(uploads.start).not.toHaveBeenCalled()
  })

  it('올리는 중에는 사진을 더 고를 수 없다', () => {
    const waiting: PhotoUpload = {
      id: 0,
      file: photoFiles(1)[0],
      status: 'uploading',
      progress: 40,
    }
    vi.mocked(useProofPhotoUploads).mockReturnValue({
      ...uploads,
      uploads: [waiting],
      isUploading: true,
    })

    render(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )

    expect(screen.getByRole('button', { name: '사진 올리기' })).toBeDisabled()
    expect(screen.getByText('1장을 올리고 있어요.')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('실패한 사진을 모두 다시 시도할 수 있다', async () => {
    const failed = failedUpload()
    vi.mocked(useProofPhotoUploads).mockReturnValue({
      ...uploads,
      uploads: [failed],
      failed: [failed],
    })
    const user = userEvent.setup()

    render(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )
    expect(screen.getByText('1장을 올리지 못했어요.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '모두 다시 시도' }))
    expect(uploads.retry).toHaveBeenCalledWith([failed])

    await user.click(screen.getByRole('button', { name: '목록에서 빼기' }))
    expect(uploads.remove).toHaveBeenCalledWith(0)
  })

  it('사진을 누르면 크게 보고 다음 사진으로 넘길 수 있다', async () => {
    const user = userEvent.setup()

    render(<ProofPhotoSection quoteId="quote-1" emptyMessage="없음" />)
    await user.click(
      screen.getByRole('button', { name: '작업 사진 1 크게 보기' }),
    )

    const dialog = screen.getByRole('dialog', { name: '작업 사진' })
    expect(within(dialog).getByText('1 / 2')).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('button', { name: '이전 사진' }),
    ).toBeDisabled()

    await user.click(within(dialog).getByRole('button', { name: '다음 사진' }))

    expect(within(dialog).getByText('2 / 2')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('img', { name: '작업 사진 2' }),
    ).toBeInTheDocument()
  })

  it('자동으로 다시 올리는 중인 사진은 상태를 보여준다', () => {
    const retrying: PhotoUpload = {
      id: 0,
      file: photoFiles(1)[0],
      status: 'retrying',
      progress: 0,
    }
    vi.mocked(useProofPhotoUploads).mockReturnValue({
      ...uploads,
      uploads: [retrying],
      isUploading: true,
    })

    render(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )

    expect(screen.getByText('다시 시도하는 중')).toBeVisible()
  })

  it('처음 불러오기에 실패하면 다시 시도 화면을 보여준다', async () => {
    const refetch = vi.fn()
    mockPhotos([], 0, { isLoadingError: true, refetch })
    const user = userEvent.setup()

    render(<ProofPhotoSection quoteId="quote-1" emptyMessage="없음" />)

    expect(screen.getByText('작업 사진을 불러오지 못했습니다.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('새로 불러오기에 실패해도 보던 사진과 실패한 사진을 그대로 보여준다', async () => {
    const refetch = vi.fn()
    mockPhotos(PHOTOS, 100, { isRefetchError: true, refetch })
    const failed = failedUpload()
    vi.mocked(useProofPhotoUploads).mockReturnValue({
      ...uploads,
      uploads: [failed],
      failed: [failed],
    })
    const user = userEvent.setup()

    render(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )

    expect(
      screen.getByText('작업 사진을 새로 불러오지 못했어요.'),
    ).toBeVisible()
    expect(screen.getByText('2/100')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /크게 보기$/ })).toHaveLength(
      2,
    )
    expect(
      screen.getByRole('button', { name: '목록에서 빼기' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다시 불러오기' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('고른 사진, 올리는 중인 사진, 다시 올릴 수 있는 사진이 있으면 나가기 전에 묻는다', async () => {
    const { container, rerender } = render(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )
    expect(useLeaveGuard).toHaveBeenLastCalledWith(false)

    const user = userEvent.setup()
    await user.upload(fileInput(container), photoFiles(1))
    expect(useLeaveGuard).toHaveBeenLastCalledWith(true)

    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(useLeaveGuard).toHaveBeenLastCalledWith(false)

    vi.mocked(useProofPhotoUploads).mockReturnValue({
      ...uploads,
      uploads: [failedUpload()],
      failed: [failedUpload()],
    })
    rerender(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )
    expect(useLeaveGuard).toHaveBeenLastCalledWith(true)

    const unreadable = { ...failedUpload(), retryable: false }
    vi.mocked(useProofPhotoUploads).mockReturnValue({
      ...uploads,
      uploads: [unreadable],
      failed: [unreadable],
    })
    rerender(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )
    expect(useLeaveGuard).toHaveBeenLastCalledWith(false)
  })

  it('나가려고 하면 확인 창을 띄우고 고른 대로 처리한다', async () => {
    vi.mocked(useLeaveGuard).mockReturnValue({ ...leaveGuard, isOpen: true })
    const user = userEvent.setup()

    render(
      <ProofPhotoSection quoteId="quote-1" canUpload emptyMessage="없음" />,
    )

    const dialog = screen.getByRole('dialog', { name: '페이지를 나갈까요?' })
    expect(dialog).toHaveTextContent('아직 올리지 못한 사진이 있어요.')

    await user.click(within(dialog).getByRole('button', { name: '취소' }))
    expect(leaveGuard.stay).toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: '나가기' }))
    expect(leaveGuard.leave).toHaveBeenCalled()
  })
})
