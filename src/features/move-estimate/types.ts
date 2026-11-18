import type { components, operations } from '@/lib/api-schema'

export type MoveEstimate = components['schemas']['MoveEstimate']

export type Surcharge = MoveEstimate['surcharges'][number]

export type MoveEstimateQuery = NonNullable<
  operations['getMoveEstimate']['parameters']['query']
>
