import { describe, expect, it } from 'vitest'
import { stripGainMap } from '@/features/proof-photos/lib/stripGainMap'

const SOI = [0xff, 0xd8]
const EOI = [0xff, 0xd9]

const text = (value: string) => [...value].map((char) => char.charCodeAt(0))

function segment(marker: number, ...payload: (number[] | string)[]) {
  const body = payload.flatMap((part) =>
    typeof part === 'string' ? text(part) : part,
  )
  const length = body.length + 2
  return [0xff, marker, length >> 8, length & 0xff, ...body]
}

const exif = segment(0xe1, 'Exif\0\0', [...SOI, 0x01, 0x02, ...EOI])
const icc = segment(0xe2, 'ICC_PROFILE\0', [1, 2, 3])
const mpf = segment(0xe2, 'MPF\0', [0x4d, 0x4d, 0, 0x2a])
const iso = segment(0xe2, 'urn:iso:std:iso:ts:21496:-1\0', [0, 0])
const xmp = segment(0xe1, 'http://ns.adobe.com/xap/1.0/\0<hdrgm:Version/>')
const extendedXmp = segment(0xe1, 'http://ns.adobe.com/xmp/extension/\0<x/>')
const quantization = segment(0xdb, [0, 1, 2])
const frame = segment(0xc0, [8, 0, 2, 0, 2])
const huffman = segment(0xc4, [0, 1])
const scan = [...segment(0xda, [1, 1, 0]), 0x12, 0xff, 0x00, 0x34, 0xff, 0xd0]
const gainMap = [...SOI, ...quantization, ...frame, ...scan, ...EOI]

async function strip(bytes: number[], type = 'image/jpeg') {
  const result = await stripGainMap(new Blob([new Uint8Array(bytes)], { type }))
  return {
    type: result.type,
    bytes: [...new Uint8Array(await result.arrayBuffer())],
  }
}

describe('stripGainMap', () => {
  it('iPhone 사진에서 뒤에 붙은 GainMap과 MPF를 지우고 EXIF와 색 프로필은 남긴다', async () => {
    const primary = [...exif, ...icc, ...quantization, ...frame, ...scan]

    const result = await strip([
      ...SOI,
      ...exif,
      ...mpf,
      ...icc,
      ...quantization,
      ...frame,
      ...scan,
      ...EOI,
      ...gainMap,
    ])

    expect(result.bytes).toEqual([...SOI, ...primary, ...EOI])
    expect(result.type).toBe('image/jpeg')
  })

  it('Android Ultra HDR 사진에서 XMP, ISO GainMap 정보, GainMap, 모션 포토를 지운다', async () => {
    const result = await strip([
      ...SOI,
      ...exif,
      ...xmp,
      ...extendedXmp,
      ...icc,
      ...iso,
      ...mpf,
      ...quantization,
      ...frame,
      ...scan,
      ...EOI,
      ...gainMap,
      ...text('ftypmp42'),
    ])

    expect(result.bytes).toEqual([
      ...SOI,
      ...exif,
      ...icc,
      ...quantization,
      ...frame,
      ...scan,
      ...EOI,
    ])
  })

  it('프로그레시브 JPEG는 모든 스캔을 남긴다', async () => {
    const progressive = [...SOI, ...frame, ...scan, ...huffman, ...scan, ...EOI]

    const result = await strip([...progressive, ...gainMap])

    expect(result.bytes).toEqual(progressive)
  })

  it('GainMap이 없는 JPEG는 그대로 둔다', async () => {
    const plain = [...SOI, ...exif, ...icc, ...frame, ...scan, ...EOI]

    expect((await strip(plain)).bytes).toEqual(plain)
  })

  it('JPEG가 아니거나 구조를 읽을 수 없으면 원본을 그대로 쓴다', async () => {
    const png = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])])
    const truncated = new Blob([new Uint8Array([...SOI, ...frame, ...scan])])

    expect(await stripGainMap(png)).toBe(png)
    expect(await stripGainMap(truncated)).toBe(truncated)
  })
})
