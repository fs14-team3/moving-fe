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

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number | null,
    readonly details?: ApiErrorDetail[],
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'ApiError'
  }
}

/** Axios 오류를 프론트 공통 에러 형태로 변환 */
export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return new ApiError(
      'UNKNOWN_ERROR',
      '알 수 없는 오류가 발생했습니다.',
      null,
      undefined,
      { cause: error },
    )
  }

  if (!error.response) {
    return new ApiError(
      'NETWORK_ERROR',
      '서버로부터 응답을 받지 못했습니다.',
      null,
      undefined,
      { cause: error },
    )
  }

  const { status, data } = error.response

  return new ApiError(
    data?.error?.code ?? 'UNKNOWN_ERROR',
    data?.error?.message ?? '알 수 없는 오류가 발생했습니다.',
    status,
    data?.error?.details,
    { cause: error },
  )
}

/** 전달받은 오류가 공통 API 에러인지 확인 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
