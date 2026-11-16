const SOI = 0xd8
const EOI = 0xd9
const SOS = 0xda

const GAIN_MAP_SEGMENTS = [
  [0xe1, 'http://ns.adobe.com/xap/1.0/\0'],
  [0xe1, 'http://ns.adobe.com/xmp/extension/\0'],
  [0xe2, 'MPF\0'],
  [0xe2, 'urn:iso:std:iso:ts:21496:-1\0'],
] as const

function startsWith(bytes: Uint8Array, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    if (bytes[offset + i] !== text.charCodeAt(i)) return false
  }
  return true
}

function isGainMapSegment(bytes: Uint8Array, marker: number, offset: number) {
  return GAIN_MAP_SEGMENTS.some(
    ([gainMapMarker, id]) =>
      marker === gainMapMarker && startsWith(bytes, offset, id),
  )
}

function isInScanData(byte: number) {
  return byte === 0x00 || byte === 0xff || (byte >= 0xd0 && byte <= 0xd7)
}

function nextMarker(bytes: Uint8Array, from: number) {
  let i = bytes.indexOf(0xff, from)
  while (i !== -1 && isInScanData(bytes[i + 1])) {
    i = bytes.indexOf(0xff, i + 1)
  }
  return i
}

function primaryImage(bytes: Uint8Array<ArrayBuffer>) {
  if (bytes[0] !== 0xff || bytes[1] !== SOI) return null
  const parts = [bytes.subarray(0, 2)]
  let i = 2

  while (i + 1 < bytes.length && bytes[i] === 0xff) {
    const marker = bytes[i + 1]
    if (marker === 0xff) {
      i += 1
      continue
    }
    if (marker === EOI) {
      parts.push(bytes.subarray(i, i + 2))
      return parts
    }
    if (i + 4 > bytes.length) return null

    const end = i + 2 + ((bytes[i + 2] << 8) | bytes[i + 3])
    if (end > bytes.length) return null
    if (!isGainMapSegment(bytes, marker, i + 4)) {
      parts.push(bytes.subarray(i, end))
    }
    i = end

    if (marker === SOS) {
      const next = nextMarker(bytes, i)
      if (next === -1) return null
      parts.push(bytes.subarray(i, next))
      i = next
    }
  }
  return null
}

export async function stripGainMap(file: Blob) {
  const parts = primaryImage(new Uint8Array(await file.arrayBuffer()))
  return parts ? new Blob(parts, { type: file.type }) : file
}
