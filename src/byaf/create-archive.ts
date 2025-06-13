import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import JSZip from 'jszip'
import path from 'path'
import {
  ByafManifest,
  byafCharacterSchema,
  byafManifestSchema,
  byafScenarioSchema,
  ByafInputCharacter,
  ByafCharacter,
  ByafInputScenario,
  ByafScenario,
} from './types/schemas'
import { iife } from '../utils/iife'

type CreateArchiveArgs = {
  outputPath: string
  character: ByafInputCharacter
  scenarios: Array<ByafInputScenario>
  author?: {
    name: string
    backyardURL: string
    [key: string]: unknown
  }
}

/**
 * Creates a Backyard Archive (.byaf) file from character and scenario data.
 * The archive is a ZIP file containing a manifest and the character/scenario data.
 * All files are stored uncompressed (STORE) for better performance and to avoid
 * potential issues with compressed binary files.
 *
 * @param args - The arguments for creating the archive
 * @param args.outputPath - Where to save the .byaf file
 * @param args.character - The character data (schema version handled internally)
 * @param args.scenarios - Array of scenario data (schema version handled internally)
 * @param args.author - Optional author information
 * @param args.characterImages - Optional array of image paths to include
 * @param opts.validateInputs - Whether to validate the inputs with the zod schema (default: false)
 */
export const createByaArchive = async (
  args: CreateArchiveArgs,
  opts?: { validateInputs?: boolean },
): Promise<{ error: string | null }> => {
  if (opts?.validateInputs) {
    // Validate inputs
    const characterResult = byafCharacterSchema.safeParse(args.character)
    if (!characterResult.success) {
      return {
        error: `Invalid character data: ${characterResult.error.message}`,
      }
    }

    if (args.character.id === '') {
      return { error: 'Character ID is required' }
    }

    for (const scenario of args.scenarios) {
      const scenarioResult = byafScenarioSchema.safeParse(scenario)
      if (!scenarioResult.success) {
        return {
          error: `Invalid scenario data: ${scenarioResult.error.message}`,
        }
      }
    }
  }

  // Create a new ZIP archive
  const zip = new JSZip()

  // Create manifest
  const manifest: ByafManifest = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    ...(args.author && { author: args.author }),
    characters: [`characters/${args.character.id}/character.json`],
    scenarios: args.scenarios.map((_, i) => `scenarios/scenario${i + 1}.json`),
  }

  // Validate manifest
  const manifestResult = byafManifestSchema.safeParse(manifest)
  if (!manifestResult.success) {
    return { error: `Invalid manifest data: ${manifestResult.error.message}` }
  }

  // Add files to ZIP using STORE compression (no compression)
  zip.file('manifest.json', JSON.stringify(manifest, null, 2), {
    compression: 'STORE',
  })

  const characterImages = await Promise.all(
    args.character.images?.map(async (image) => {
      const imageName = path.basename(image.file.name)
      const imageData = await image.file.arrayBuffer()
      zip.file(
        `characters/${args.character.id}/images/${imageName}`,
        imageData,
        { compression: 'STORE' },
      )
      return { path: `images/${imageName}`, label: image.label }
    }),
  )

  const character: ByafCharacter = {
    ...args.character,
    images: characterImages,
  }

  zip.file(
    `characters/${args.character.id}/character.json`,
    JSON.stringify(character, null, 2),
    { compression: 'STORE' },
  )

  for (let i = 0; i < args.scenarios.length; i++) {
    const scenario = args.scenarios[i]
    const backgroundImage = await iife(async () => {
      if (scenario.backgroundImage) {
        const imageName = path.basename(scenario.backgroundImage.name)
        const extension = path.extname(imageName)
        const imageData = await scenario.backgroundImage.arrayBuffer()
        zip.file(
          `scenarios/scenario${i + 1}-background${extension}`,
          imageData,
          {
            compression: 'STORE',
          },
        )
        return `scenarios/scenario${i + 1}-background${extension}`
      }
    })

    const outputScenario: ByafScenario = {
      ...scenario,
      backgroundImage,
    }

    zip.file(
      `scenarios/scenario${i + 1}.json`,
      JSON.stringify(outputScenario, null, 2),
      { compression: 'STORE' },
    )
  }

  // Generate the ZIP file
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'STORE',
  })

  // Ensure the output directory exists
  await mkdir(path.dirname(args.outputPath), { recursive: true })

  // Write the ZIP file
  const writeStream = createWriteStream(args.outputPath)
  writeStream.write(zipBuffer)
  writeStream.end()

  // Wait for the write to complete
  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
  })

  return { error: null }
}
