import { z } from 'zod'

export const backyardPromptTemplate = 'general' // used to support old clients
export const chatMLPromptTemplate = 'ChatML'
export const llama3PromptTemplate = 'Llama3'
export const gemma2PromptTemplate = 'Gemma2'
export const commandRPromptTemplate = 'CommandR'
export const mistralInstructPromptTemplate = 'MistralInstruct'

const promptTemplateZod = z
  .enum([
    backyardPromptTemplate,
    chatMLPromptTemplate,
    llama3PromptTemplate,
    gemma2PromptTemplate,
    commandRPromptTemplate,
    mistralInstructPromptTemplate,
  ])
  .nullable() // null indicates to use the model promptFormat as the template

const legacyChatZod = z.object({
  ChatItems: z.array(
    z.object({
      id: z.string(),
      input: z.string(),
      output: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      RegenSwipes: z.array(
        z.object({
          id: z.string(),
          updatedAt: z.date(),
          createdAt: z.date(),
          text: z.string(),
          activeTimestamp: z.date(),
        }),
      ),
    }),
  ),
})

const characterSharedZod = z.object({
  Chat: z.array(legacyChatZod),
  id: z.string(),
  updatedAt: z.date(),
  createdAt: z.date(),
  aiDisplayName: z.string(),
  customDialogue: z.string(),
  basePrompt: z.string(),
  model: z.string(),
  scenario: z.string(),
  temperature: z.number(),
  repeatPenalty: z.number(),
  repeatLastN: z.number(),
  isNSFW: z.boolean(),
  aiName: z.string(),
  aiPersona: z.string(),
  topK: z.number(),
  topP: z.number(),
  firstMessage: z.string().nullable(),
  grammar: z.string().nullable(),
  loreItems: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      order: z.string().optional(),
      value: z.string(),
    }),
  ),
})

const BackyardCharacterExportV1ZodType = z.object({
  character: characterSharedZod.extend({
    mirostatEnabled: z.boolean(),
    mirostatLearningRate: z.number(),
    mirostatEntropy: z.number(),
  }),
  version: z.literal(1),
  error: z.undefined().optional(),
})

const characterV2Zod = characterSharedZod.extend({
  minP: z.number(),
  minPEnabled: z.boolean(),
})

const BackyardCharacterExportV2ZodType = z.object({
  character: characterV2Zod,
  version: z.literal(2),
  error: z.undefined().optional(),
})

const characterV3Zod = characterV2Zod.extend({
  promptTemplate: promptTemplateZod,
})

const BackyardCharacterExportV3ZodType = z.object({
  character: characterV3Zod,
  version: z.literal(3),
  error: z.undefined().optional(),
})

const characterV4Zod = characterV3Zod.extend({
  canDeleteCustomDialogue: z.boolean(),
})

const BackyardCharacterExportV4ZodType = z.object({
  character: characterV4Zod,
  version: z.literal(4),
  error: z.undefined().optional(),
})

export type BackyardCharacterExportV1 = z.infer<
  typeof BackyardCharacterExportV1ZodType
>

// functions that parse as a CharacterZodType
export const isBackyardCharacterExportV1 = (
  character: any,
): character is BackyardCharacterExportV1 => {
  const { success } = BackyardCharacterExportV1ZodType.safeParse(character)
  return success
}

export type BackyardCharacterExportV2 = z.infer<
  typeof BackyardCharacterExportV2ZodType
>

export const isBackyardCharacterExportV2 = (
  character: any,
): character is BackyardCharacterExportV2 => {
  const { success } = BackyardCharacterExportV2ZodType.safeParse(character)
  return success
}

export type BackyardCharacterExportV3 = z.infer<
  typeof BackyardCharacterExportV3ZodType
>

export const isBackyardCharacterExportV3 = (
  character: any,
): character is BackyardCharacterExportV3 => {
  const { success } = BackyardCharacterExportV3ZodType.safeParse(character)
  return success
}

export type BackyardCharacterExportV4 = z.infer<
  typeof BackyardCharacterExportV4ZodType
>

export const isBackyardCharacterExportV4 = (
  character: any,
): character is BackyardCharacterExportV4 => {
  const { success } = BackyardCharacterExportV4ZodType.safeParse(character)
  return success
}
