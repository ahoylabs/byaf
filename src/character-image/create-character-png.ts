import { BackyardCharacterExportV4 } from './types/character-exports'
import { ExifTool } from 'exiftool-vendored'
import { iife } from '../utils/iife'
import sharp from 'sharp'

const bytesToBase64 = (bytes: Uint8Array) => {
  const binString = String.fromCodePoint(...bytes)
  return btoa(binString)
}

/**
 * Creates a character png file with the character metadata in the exif data
 * @param args - The arguments for the function
 * @param args.imagePath - The path to the image file
 * @param args.character - The character to create the png for
 * @param args.outputPath - The path to the output file
 * @param args.quality - The quality of the png file
 *
 * This is Node.js only because it uses exiftool-vendored which is only available on Node.js.
 */
export const createCharacterPng = async (args: {
  imagePath: string
  character: BackyardCharacterExportV4
  outputPath: string
  quality?: number
}) => {
  const exifTool = new ExifTool({ taskTimeoutMillis: 5000 })

  // ensure the filePath ends with .png because the user may remove it
  const outputFilePath = iife(() => {
    let path = args.outputPath
    if (!path.endsWith('.png')) {
      path += '.png'
    }
    return path
  })

  await sharp(args.imagePath)
    .png({ quality: args.quality ?? 90 })
    .toFile(outputFilePath)

  exifTool.write(
    outputFilePath,
    {
      UserComment: bytesToBase64(
        new TextEncoder().encode(JSON.stringify(args.character)),
      ),
    },
    ['-overwrite_original'],
  )
}
