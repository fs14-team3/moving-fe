import axios from 'axios'

interface ApiErrorDetail {
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

interface ApiError {
  code: string
  message: string
  status: number | null
  details?: ApiErrorDetail[]
}

export function toApiError(error: unknown): ApiError {
  // Axios 에러가 아닌 경우
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
