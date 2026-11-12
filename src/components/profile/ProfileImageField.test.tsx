import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileImageField from '@/components/profile/ProfileImageField'
import { ApiError } from '@/lib/api-error'

const upload = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null as Error | null,
}))

vi.mock('@/features/profile/hooks/useUploadImage', () => ({
  useUploadImage: () => upload,
}))

const SAVED_URL =
  'https://moving.s3.ap-southeast-2.amazonaws.com/profile-images/user-1/saved'
const UPLOADED_URL =
  'https://moving.s3.ap-southeast-2.amazonaws.com/profile-images/user-1/new'

function imageFile(type = 'image/png', size = 10) {
  return new File([new Uint8Array(size)], 'me.png', { type })
}

function renderImageField(imageUrl: string | null = null, error?: string) {
  const user = userEvent.setup({ applyAccept: false })
  const onChange = vi.fn()
  const onUploadingChange = vi.fn()
  const props = { imageUrl, error, onChange, onUploadingChange }
  const { rerender } = render(<ProfileImageField {...props} />)

  return {
    user,
    onChange,
    onUploadingChange,
    input: screen.getByLabelText('프로필 이미지'),
    rerender: () => rerender(<ProfileImageField {...props} />),
  }
}

const shownImage = () => document.querySelector('img')

describe('ProfileImageField', () => {
  beforeEach(() => {
    upload.mutate.mockReset()
    upload.isPending = false
    upload.isError = false
    upload.error = null
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })

  it('이미지가 없으면 기본 아이콘을 보여 준다', () => {
    renderImageField()

    expect(shownImage()).toBeNull()
  })

  it('저장된 이미지를 보여 준다', () => {
    renderImageField(SAVED_URL)

    expect(shownImage()?.getAttribute('src')).toContain(
      encodeURIComponent(SAVED_URL),
    )
  })

  it('고른 이미지를 미리 보여 주고 올린 URL을 알린다', async () => {
    const { user, input, onChange, onUploadingChange } = renderImageField()
    const file = imageFile()

    await user.upload(input, file)

    expect(shownImage()).toHaveAttribute('src', 'blob:preview')
    expect(onUploadingChange).toHaveBeenCalledWith(true)
    const [uploaded, callbacks] = upload.mutate.mock.calls[0]
    expect(uploaded).toBe(file)

    act(() => {
      callbacks.onSuccess(UPLOADED_URL)
      callbacks.onSettled()
    })

    expect(onChange).toHaveBeenCalledWith(UPLOADED_URL)
    expect(onUploadingChange).toHaveBeenLastCalledWith(false)
  })

  it('같은 파일을 다시 골라도 다시 올린다', async () => {
    const { user, input } = renderImageField()
    const file = imageFile()

    await user.upload(input, file)
    await user.upload(input, file)

    expect(upload.mutate).toHaveBeenCalledTimes(2)
  })

  it.each([
    [
      '형식이 다르면',
      imageFile('image/gif'),
      'JPG, PNG, WEBP 이미지를 선택해 주세요.',
    ],
    [
      '5MB를 넘으면',
      imageFile('image/jpeg', 5 * 1024 * 1024 + 1),
      '5MB 이하의 이미지를 선택해 주세요.',
    ],
  ])('%s 올리지 않고 안내한다', async (_name, file, message) => {
    const { user, input, onUploadingChange } = renderImageField(SAVED_URL)

    await user.upload(input, file)

    expect(input).toHaveAccessibleDescription(message)
    expect(upload.mutate).not.toHaveBeenCalled()
    expect(onUploadingChange).not.toHaveBeenCalled()
    expect(shownImage()?.getAttribute('src')).toContain(
      encodeURIComponent(SAVED_URL),
    )
  })

  it('올리는 중에는 로딩을 보여 준다', () => {
    upload.isPending = true
    renderImageField()

    expect(screen.getByText('이미지를 올리는 중')).toBeInTheDocument()
  })

  it('올리지 못하면 저장된 이미지로 돌아가 다시 고르게 한다', async () => {
    const { user, input, rerender } = renderImageField(SAVED_URL)
    await user.upload(input, imageFile())

    upload.isError = true
    rerender()

    expect(input).toHaveAccessibleDescription(
      '이미지를 올리지 못했습니다. 다시 선택해 주세요.',
    )
    expect(shownImage()?.getAttribute('src')).toContain(
      encodeURIComponent(SAVED_URL),
    )
  })

  it('서버가 이미지를 거절한 이유를 보여 준다', async () => {
    const { user, input, rerender } = renderImageField()
    await user.upload(input, imageFile('image/jpeg'))

    upload.isError = true
    upload.error = new ApiError('VALIDATION_ERROR', '잘못된 요청입니다', 400, [
      { field: 'file', reason: '1,300만 화소 이하 이미지만 올릴 수 있습니다' },
    ])
    rerender()

    expect(input).toHaveAccessibleDescription(
      '1,300만 화소 이하 이미지만 올릴 수 있습니다',
    )
  })

  it('서버가 알려 준 오류를 보여 준다', () => {
    const { input } = renderImageField(null, '이미지를 다시 선택해 주세요.')

    expect(input).toHaveAccessibleDescription('이미지를 다시 선택해 주세요.')
  })
})
