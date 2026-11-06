import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type CreateMoveRequestBody = Schemas['MoveRequestCreate']

export type MoveRequestResponse = Schemas['MoveRequest']

export type ActiveMoveRequestResponse =
  operations['getActiveMoveRequest']['responses']['200']['content']['application/json']
