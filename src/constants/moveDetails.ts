import type { components } from '@/lib/api-schema'
import type { Option } from '@/lib/options'

type Schemas = components['schemas']

export type ServiceLevel = Schemas['ServiceLevel']
export type BuildingType = Schemas['BuildingType']
export type Floor = Schemas['Building']['floor']
export type AreaRange = Schemas['AreaRange']
export type ResidentCount = NonNullable<
  Schemas['MoveRequestDetails']['residentCount']
>
export type BoxRange = Schemas['BoxRange']
export type MoveItem = Schemas['MoveItem']

export const SERVICE_LEVEL_OPTIONS: (Option<ServiceLevel> & {
  description: string
})[] = [
  {
    value: 'BASIC',
    label: '일반이사',
    description: '짐 포장과 정리는 직접 하고 운반만 맡겨요',
  },
  {
    value: 'HALF_PACKING',
    label: '반포장이사',
    description: '포장과 운반은 맡기고 도착 후 정리는 직접 해요',
  },
  {
    value: 'FULL_PACKING',
    label: '포장이사',
    description: '포장부터 운반, 정리까지 모두 맡겨요',
  },
]

export const AREA_RANGE_OPTIONS: Option<AreaRange>[] = [
  { value: 'UNDER_10', label: '10평 미만' },
  { value: 'TENS', label: '10평대' },
  { value: 'TWENTIES', label: '20평대' },
  { value: 'THIRTIES', label: '30평대' },
  { value: 'OVER_40', label: '40평 이상' },
]

export const RESIDENT_COUNT_OPTIONS: Option<ResidentCount>[] = [
  { value: 1, label: '1인' },
  { value: 2, label: '2인' },
  { value: 3, label: '3인' },
  { value: 4, label: '4인 이상' },
]

export const BUILDING_TYPE_OPTIONS: Option<BuildingType>[] = [
  { value: 'APARTMENT', label: '아파트' },
  { value: 'VILLA', label: '빌라·연립' },
  { value: 'OFFICETEL', label: '오피스텔' },
  { value: 'HOUSE', label: '주택' },
  { value: 'COMMERCIAL', label: '상가·사무실' },
]

export const FLOOR_OPTIONS: Option<Floor>[] = [
  { value: -1, label: '지하' },
  { value: 1, label: '1층' },
  { value: 2, label: '2층' },
  { value: 3, label: '3층' },
  { value: 4, label: '4층' },
  { value: 5, label: '5층 이상' },
]

export const ELEVATOR_OPTIONS: Option<boolean>[] = [
  { value: true, label: '있음' },
  { value: false, label: '없음' },
]

export const PARKING_OPTIONS: Option<boolean>[] = [
  { value: true, label: '가능' },
  { value: false, label: '불가능' },
]

export const BOX_RANGE_OPTIONS: Option<BoxRange>[] = [
  { value: 'UP_TO_10', label: '10개 이하' },
  { value: 'UP_TO_20', label: '11~20개' },
  { value: 'UP_TO_30', label: '21~30개' },
  { value: 'UP_TO_50', label: '31~50개' },
  { value: 'OVER_50', label: '51개 이상' },
]

export const MOVE_ITEM_CATEGORIES: {
  label: string
  options: Option<MoveItem>[]
}[] = [
  {
    label: '가구',
    options: [
      { value: 'BED_SINGLE', label: '침대(싱글)' },
      { value: 'BED_SUPER_SINGLE', label: '침대(슈퍼싱글)' },
      { value: 'BED_DOUBLE', label: '침대(더블)' },
      { value: 'BED_QUEEN', label: '침대(퀸)' },
      { value: 'BED_KING', label: '침대(킹)' },
      { value: 'WARDROBE_ONE_DOOR', label: '옷장(단문)' },
      { value: 'WARDROBE_TWO_DOOR', label: '옷장(양문)' },
      { value: 'WARDROBE_THREE_PLUS_DOOR', label: '옷장(3문 이상)' },
      { value: 'SOFA_SMALL', label: '소파(1~2인용)' },
      { value: 'SOFA_MEDIUM', label: '소파(3인용)' },
      { value: 'SOFA_LARGE', label: '소파(4인용 이상)' },
      { value: 'DINING_TABLE', label: '식탁·테이블' },
      { value: 'DESK', label: '책상' },
      { value: 'CHAIR', label: '의자' },
      { value: 'BOOKSHELF', label: '책장' },
      { value: 'DRAWER', label: '수납장·서랍장' },
      { value: 'HANGER', label: '행거' },
      { value: 'VANITY', label: '화장대' },
      { value: 'SHOE_CABINET', label: '신발장' },
      { value: 'TV_STAND', label: 'TV장·거실장' },
    ],
  },
  {
    label: '가전',
    options: [
      { value: 'FRIDGE_SMALL', label: '냉장고(소형)' },
      { value: 'FRIDGE_STANDARD', label: '냉장고(일반형)' },
      { value: 'FRIDGE_SIDE_BY_SIDE', label: '냉장고(양문형)' },
      { value: 'FRIDGE_FOUR_DOOR', label: '냉장고(4도어)' },
      { value: 'KIMCHI_FRIDGE', label: '김치냉장고' },
      { value: 'WASHER_DRUM', label: '세탁기(드럼)' },
      { value: 'WASHER_TOP_LOAD', label: '세탁기(통돌이)' },
      { value: 'DRYER', label: '건조기' },
      { value: 'AIRCON_WALL', label: '에어컨(벽걸이)' },
      { value: 'AIRCON_STAND', label: '에어컨(스탠드)' },
      { value: 'TV', label: 'TV' },
      { value: 'COMPUTER', label: 'PC·모니터' },
      { value: 'MICROWAVE', label: '전자레인지' },
      { value: 'CLOTHES_CARE', label: '의류관리기' },
      { value: 'WATER_PURIFIER', label: '정수기' },
      { value: 'AIR_PURIFIER', label: '공기청정기' },
      { value: 'MASSAGE_CHAIR', label: '안마의자' },
    ],
  },
  {
    label: '기타',
    options: [
      { value: 'PIANO', label: '피아노' },
      { value: 'BICYCLE', label: '자전거' },
      { value: 'EXERCISE_EQUIPMENT', label: '운동기구' },
      { value: 'PLANT', label: '화분' },
      { value: 'SUITCASE', label: '캐리어' },
      { value: 'CAT_TOWER', label: '캣타워' },
      { value: 'MIRROR', label: '전신거울' },
    ],
  },
]

export const MOVE_ITEM_OPTIONS = MOVE_ITEM_CATEGORIES.flatMap(
  ({ options }) => options,
)
