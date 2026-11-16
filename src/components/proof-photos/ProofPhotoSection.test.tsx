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

function mockPhotos(photos = PHOTOS, maxCount = 100) {
  vi.mocked(useProofPhotos).mockReturnValue({
    photos,
    maxCount,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    isRefetching: false,
  } as unknown as ReturnType<typeof useProofPhotos>)
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
    const failed: PhotoUpload = {
      id: 0,
      file: photoFiles(1)[0],
      status: 'failed',
      progress: 0,
      error: '올리지 못했어요',
      retryable: true,
    }
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
})
