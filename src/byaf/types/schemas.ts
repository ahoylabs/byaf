import { z } from 'zod'

// Common types
const dateTimeString = z.string().datetime()

// Character Schema Types
export const byafCharacterSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  name: z
    .string()
    .describe('The shorthand name of the character (often a nickname)'),
  displayName: z.string().describe('The full name of the character'),
  isNSFW: z.boolean(),
  persona: z.string(),
  createdAt: dateTimeString,
  updatedAt: dateTimeString,
  loreItems: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
  images: z.array(z.object({ path: z.string(), label: z.string() })),
})

export type ByafCharacter = z.infer<typeof byafCharacterSchema>
export type ByafInputCharacter = Omit<ByafOutputCharacter, 'images'> & {
  images: { file: File; label: string }[]
}
export type ByafOutputCharacter = Omit<ByafCharacter, 'images'> & {
  images: { file: File; label: string }[]
}

export const isByafCharacter = <Type extends 'input' | 'output'>(
  data: unknown,
  type: Type,
): data is Type extends 'input' ? ByafInputCharacter : ByafOutputCharacter => {
  if (type === 'input') {
    // on input, we expect the images to be a list of `File` objects
    // which isn't supported by zod, so we omit the images field and
    // check it separately
    const result = byafCharacterSchema.omit({ images: true }).safeParse(data)
    if (!result.success) return false
    const images = (data as any).images
    if (!Array.isArray(images)) return false
    for (const image of images) {
      if (image instanceof File) {
        // check that the file is a valid image
        if (!image.type.startsWith('image/')) return false
      } else {
        return false
      }
    }
    return true
  }
  return byafCharacterSchema.safeParse(data).success
}

export const byafManifestSchema = z.object({
  schemaVersion: z.literal(1),
  createdAt: dateTimeString,
  author: z
    .object({
      name: z.string().describe('Human-readable author name'),
      backyardURL: z.string().url().describe('Canonical Backyard profile URL'),
    })
    .passthrough()
    .optional(),
  characters: z
    .array(z.string().regex(/^characters\/[^/]+\/character\.json$/))
    .min(1)
    .max(1)
    .describe(
      'Paths to character manifests. Only one character is allowed. Future versions may support multiple.',
    ),
  scenarios: z
    .array(z.string().regex(/^scenarios\/[^/]+\.json$/))
    .min(1)
    .describe('Paths to scenarios. One scenario is required.'),
})

export type ByafManifest = z.infer<typeof byafManifestSchema>

export const isByafManifest = (data: unknown): data is ByafManifest => {
  return byafManifestSchema.safeParse(data).success
}

// Scenario Schema Types

const aiMessageSchema = z.object({
  type: z.literal('ai'),
  outputs: z
    .array(
      z.object({
        createdAt: dateTimeString,
        updatedAt: dateTimeString,
        text: z.string(),
        activeTimestamp: dateTimeString,
      }),
    )
    .min(1),
})

const humanMessageSchema = z.object({
  type: z.literal('human'),
  createdAt: dateTimeString,
  updatedAt: dateTimeString,
  text: z.string(),
})

const messageSchema = z.discriminatedUnion('type', [
  aiMessageSchema,
  humanMessageSchema,
])

export const byafScenarioSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().optional().describe('Optional. The title of the scenario'),
  model: z
    .string()
    .optional()
    .describe('Optional. The model most recently used in the chat'),
  formattingInstructions: z
    .string()
    .describe(
      'Formatting instructions for the model. In previous versions, this was called `basePrompt`',
    ),
  minP: z.number(),
  minPEnabled: z.boolean(),
  temperature: z.number(),
  repeatPenalty: z.number(),
  repeatLastN: z.number(),
  topK: z.number(),
  topP: z.number(),
  exampleMessages: z.array(
    z.object({
      characterID: z.string(),
      text: z.string(),
    }),
  ),
  canDeleteExampleMessages: z
    .boolean()
    .describe(
      'If true, the model may remove example messages from the scenario in order to save tokens',
    ),
  firstMessages: z
    .array(z.object({ characterID: z.string(), text: z.string() }))
    .max(1)
    .describe(
      'Optional. The first message in the scenario. Currently, only one message is supported.',
    ),
  narrative: z.string().describe('A narrative describing the scenario'),
  promptTemplate: z
    .enum([
      'general',
      'ChatML',
      'Llama3',
      'Gemma2',
      'CommandR',
      'MistralInstruct',
    ])
    .nullable(),
  grammar: z.string().nullable().describe('Optional grammar rules'),
  messages: z.array(messageSchema),
  backgroundImage: z.string().optional(),
})

export type ByafScenario = z.infer<typeof byafScenarioSchema>
export type ByafInputScenario = Omit<ByafScenario, 'backgroundImage'> & {
  backgroundImage?: File | undefined
}

export type ByafOutputScenario = Omit<ByafScenario, 'backgroundImage'> & {
  backgroundImage?: File | undefined
}

export const isByafScenario = (data: unknown): data is ByafScenario => {
  return byafScenarioSchema.safeParse(data).success
}
