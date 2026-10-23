import axios, { isAxiosError } from 'axios'

// TODO(#D): #5의 공통 API 클라이언트와 오류 판별 함수로 교체
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

export function isUnauthorized(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401
}
