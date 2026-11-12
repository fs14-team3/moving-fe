import { useMutation } from '@tanstack/react-query'
import { uploadImage } from '@/features/profile/api'

export function useUploadImage() {
  return useMutation({ mutationFn: uploadImage })
}
