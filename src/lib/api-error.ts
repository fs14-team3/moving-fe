import axios from 'axios'

export interface ApiErrorDetail {
  field: string
  reason: string
}

interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}

export interface ApiError {
  code: string
  message: string
  status: number | null
  details?: ApiErrorDetail[]
}

/** Axios 오류를 프론트 공통 에러 형태로 변환 */
export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
      status: null,
    }
  }

  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: '서버로부터 응답을 받지 못했습니다.',
      status: null,
    }
  }

  const { status, data } = error.response

  return {
    code: data?.error?.code ?? 'UNKNOWN_ERROR',
    message: data?.error?.message ?? '알 수 없는 오류가 발생했습니다.',
    status,
    details: data?.error?.details,
  }
}

/** 전달받은 오류가 공통 API 에러인지 확인 */
export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) return false

  const apiError = error as Partial<ApiError>

  return (
    typeof apiError.code === 'string' &&
    typeof apiError.message === 'string' &&
    (typeof apiError.status === 'number' || apiError.status === null)
  )
}
