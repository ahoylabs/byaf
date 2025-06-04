import ExifReader from 'exifreader/src/exif-reader'
import {
  BackyardCharacterExportV1,
  BackyardCharacterExportV2,
  BackyardCharacterExportV3,
  BackyardCharacterExportV4,
  isBackyardCharacterExportV1,
  isBackyardCharacterExportV2,
  isBackyardCharacterExportV3,
  isBackyardCharacterExportV4,
} from './types/character-exports'
import { iife } from '../utils/iife'

// go through every nested key that is a createdAt and updatedAt recursively
// and convert it to a date
const convertDates = (obj: any) => {
  for (const key in obj) {
    if (
      key === 'createdAt' ||
      key === 'updatedAt' ||
      key === 'activeTimestamp'
    ) {
      obj[key] = new Date(obj[key])
    } else if (typeof obj[key] === 'object') {
      convertDates(obj[key])
    }
  }
}

export const parseCharacterPng = async (
  file: File,
): Promise<
  | BackyardCharacterExportV1
  | BackyardCharacterExportV2
  | BackyardCharacterExportV3
  | BackyardCharacterExportV4
  | { error: string }
> => {
  const fileSizeInMB = file.size / (1024 * 1024)
  // png
  const validTypes = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/jpg',
  ]
  const isValidFileType = validTypes.includes(file.type)

  if (fileSizeInMB > 10) {
    return { error: 'File size exceeds 10MB. Please select a smaller file' }
  }
  if (!isValidFileType) {
    return {
      error:
        'Invalid file type. Please select a valid Backyard AI or Tavern png file',
    }
  }

  const fileContent = await file.arrayBuffer()

  const tags = await ExifReader.load(fileContent, {
    async: true,
    includeUnknown: true,
  })

  if (!tags) {
    return { error: 'Failed to read metadata from uploaded file' }
  }

  // the user comment is base64 encoded in the description
  const userComment = iife(() => {
    const desc = tags.UserComment?.description || undefined
    // https://stackoverflow.com/q/8571501
    const isBase64 =
      /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/
    if (desc && isBase64.test(desc)) {
      return new TextDecoder().decode(Buffer.from(desc, 'base64'))
    }
    return desc
  })

  if (!userComment) {
    return { error: 'Failed to read metadata from uploaded file' }
  }

  const backyardCharacterDecoded = iife(() => {
    try {
      const parsed = JSON.parse(userComment)
      convertDates(parsed)
      return parsed
    } catch (_) {
      return null
    }
  })

  if (!backyardCharacterDecoded) {
    return { error: 'Failed to parse character' }
  }

  if (
    isBackyardCharacterExportV1(backyardCharacterDecoded) ||
    isBackyardCharacterExportV2(backyardCharacterDecoded) ||
    isBackyardCharacterExportV3(backyardCharacterDecoded) ||
    isBackyardCharacterExportV4(backyardCharacterDecoded)
  ) {
    return backyardCharacterDecoded
  }

  return { error: 'Invalid character export' }
}
