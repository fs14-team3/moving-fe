import type { QueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me, Role } from '@/features/auth/types'
import type { Profile } from '@/features/profile/types'

const PROFILE_FIELD = {
  CUSTOMER: 'customerProfile',
  MOVER: 'moverProfile',
} as const satisfies Record<Role, keyof Me>

export async function setMyProfile(
  queryClient: QueryClient,
  role: Role,
  profile: Profile,
) {
  await queryClient.cancelQueries({ queryKey: meQueryKey, exact: true })
  queryClient.setQueryData<Me | null>(
    meQueryKey,
    (me) => me && { ...me, hasProfile: true, [PROFILE_FIELD[role]]: profile },
  )
}
