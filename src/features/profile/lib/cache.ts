import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
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
  await queryClient.cancelQueries({
    queryKey: queryKeys.user.me(),
    exact: true,
  })
  queryClient.setQueryData<Me | null>(
    queryKeys.user.me(),
    (me) => me && { ...me, hasProfile: true, [PROFILE_FIELD[role]]: profile },
  )
}
