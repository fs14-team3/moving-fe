import axios from 'axios'
import api from '@/lib/api'
import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ProofPhoto = Schemas['ProofPhoto']

export type ProofPhotoList = Schemas['ProofPhotoList']

export type ProofPhotoUpload = Schemas['ProofPhotoUpload']

export type ProofPhotoType = Schemas['ProofPhotoUploadCreate']['contentType']

export async function getProofPhotos(quoteId: string) {
  const { data } = await api.get<ProofPhotoList>(
    `/quotes/${quoteId}/proof-photos`,
  )
  return data
}

export async function createProofPhotoUploads(
  quoteId: string,
  body: Schemas['ProofPhotoUploadCreate'],
) {
  const { data } = await api.post<Schemas['ProofPhotoUploadList']>(
    `/quotes/${quoteId}/proof-photos/uploads`,
    body,
  )
  return data.items
}

export async function uploadToStorage(
  { url, fields }: Schemas['PresignedPost'],
  file: Blob,
  onProgress: (loaded: number) => void,
) {
  const body = new FormData()
  for (const [name, value] of Object.entries(fields)) body.append(name, value)
  body.append('file', file)
  await axios.post(url, body, {
    onUploadProgress: ({ loaded }) => onProgress(loaded),
  })
}

export async function confirmProofPhoto(quoteId: string, uploadId: string) {
  const { data } = await api.post<ProofPhoto>(
    `/quotes/${quoteId}/proof-photos`,
    { uploadId },
  )
  return data
}
