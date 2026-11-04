import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type CreateMoveRequestBody = Schemas['MoveRequestCreate']

export type CreateMoveRequestResponse = Schemas['MoveRequest']
