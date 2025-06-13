import { readFile } from 'fs/promises'
import JSZip from 'jszip'
import path from 'path/posix'
import { z } from 'zod'
import { iife } from '../utils/iife'
import {
  ByafOutputCharacter,
  ByafManifest,
  ByafScenario,
  byafCharacterSchema,
  byafManifestSchema,
  byafScenarioSchema,
  ByafCharacter,
  ByafOutputScenario,
} from './types/schemas'

export type ByafArchive = {
  manifest: ByafManifest
  character: ByafOutputCharacter
  scenarios: ByafOutputScenario[]
}

/**
 * Validates that a file path matches the expected pattern for a character or scenario file
 */
const validateFilePath = (
  filePath: string,
  pattern: RegExp,
): { error: string | null } => {
  if (!pattern.test(filePath)) {
    return { error: `Invalid file path: ${filePath}` }
  }
  return { error: null }
}

/**
 * Reads and validates a JSON file from a ZIP archive
 */
const readAndValidateJson = async <T>(
  zip: JSZip,
  filePath: string,
  schema: z.ZodType<T>,
  context: string,
): Promise<T | { error: string }> => {
  const file = zip.file(filePath)
  if (!file) {
    return { error: `${context} file not found: ${filePath}` }
  }

  const content = await iife(async () => {
    try {
      return await file.async('string')
    } catch (_) {
      return { error: `Failed to read ${context} file: ${filePath}` }
    }
  })

  if (typeof content !== 'string') {
    return { error: content.error }
  }

  const json = await iife(async () => {
    try {
      return JSON.parse(content) as { error?: undefined }
    } catch (_) {
      return { error: `Failed to parse ${context} file as JSON: ${filePath}` }
    }
  })

  if (json.error) {
    return { error: json.error }
  }

  const result = schema.safeParse(json)
  if (!result.success) {
    return {
      error: `Invalid ${context} data in ${filePath}: ${result.error.message}`,
    }
  }

  return result.data
}

/**
 * Parses a Backyard Archive (.byaf) file, validating all content against the schema definitions.
 * The archive must contain:
 * - A valid manifest.json
 * - A single character definition
 * - One or more scenario definitions
 * - Any referenced character images
 *
 * @param filePath - Path to the .byaf file
 * @returns A validated archive containing all parsed data
 */
export const parseByaArchive = async (
  filePath: string,
): Promise<ByafArchive | { error: string }> => {
  const zipBuffer = await iife(async () => {
    try {
      return await readFile(filePath)
    } catch (_) {
      return { error: `Failed to read archive file: ${filePath}` }
    }
  })

  if ('error' in zipBuffer) {
    return { error: zipBuffer.error }
  }

  const zip = await iife(async () => {
    try {
      return await JSZip.loadAsync(zipBuffer)
    } catch (error) {
      return { error: `Failed to parse archive as ZIP file: ${error}` }
    }
  })

  if ('error' in zip) {
    return { error: zip.error }
  }

  // Read and validate manifest
  const manifest = await readAndValidateJson<ByafManifest>(
    zip,
    'manifest.json',
    byafManifestSchema,
    'manifest',
  )

  if ('error' in manifest) {
    return { error: manifest.error }
  }

  // Validate character path
  if (manifest.characters.length !== 1) {
    return { error: 'Archive must contain exactly one character' }
  }

  const validateFilePathResult = validateFilePath(
    manifest.characters[0],
    /^characters\/[^/]+\/character\.json$/,
  )

  if (validateFilePathResult.error) {
    return { error: validateFilePathResult.error }
  }

  // Read and validate character
  const character = await readAndValidateJson<ByafCharacter>(
    zip,
    manifest.characters[0],
    byafCharacterSchema,
    'character',
  )

  if ('error' in character) {
    return { error: character.error }
  }

  // Validate and read scenarios
  const scenarios: ByafOutputScenario[] = []
  for (const scenarioPath of manifest.scenarios) {
    const validateFilePathResult = validateFilePath(
      scenarioPath,
      /^scenarios\/[^/]+\.json$/,
    )

    if (validateFilePathResult.error) {
      return { error: validateFilePathResult.error }
    }

    const scenario = await readAndValidateJson<ByafScenario>(
      zip,
      scenarioPath,
      byafScenarioSchema,
      'scenario',
    )

    if ('error' in scenario) {
      return { error: scenario.error }
    }

    const backgroundImage = await iife(async () => {
      if (scenario.backgroundImage) {
        const file = zip.file(scenario.backgroundImage)
        if (!file) {
          return {
            error: `Referenced background image not found in archive: ${scenario.backgroundImage}`,
          }
        }
        const fileName = path.basename(scenario.backgroundImage)
        const buffer = await file.async('arraybuffer')
        return { file: new File([buffer], fileName) }
      }
      return undefined
    })

    if (backgroundImage && 'error' in backgroundImage) {
      return { error: backgroundImage.error }
    }

    scenarios.push({
      ...scenario,
      backgroundImage: backgroundImage?.file,
    })
  }

  // Read character images
  const imageDir = path.dirname(manifest.characters[0])
  const images: { label: string; file: File }[] = []

  for (const item of character.images) {
    const imagePath = path.join(imageDir, item.path)
    const file = zip.file(imagePath)
    if (!file) {
      return { error: `Referenced image not found in archive: ${imagePath}` }
    }

    const buffer = await iife(async () => {
      try {
        return await file.async('arraybuffer')
      } catch (_) {
        return { error: `Failed to read image: ${imagePath}` }
      }
    })

    if ('error' in buffer) {
      return { error: buffer.error }
    }

    const fileName = path.basename(imagePath)

    images.push({ label: item.label, file: new File([buffer], fileName) })
  }

  return {
    manifest,
    character: { ...character, images },
    scenarios,
  }
}
