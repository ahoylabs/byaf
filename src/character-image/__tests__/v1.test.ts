import path from 'path'
import { describe, expect, test } from 'vitest'
import { parseCharacterPng } from '../parse-character-png'
import fs from 'fs/promises'
import { isBackyardCharacterExportV1 } from '../types/character-exports'

describe('parse character card v1', () => {
  test('basic', async () => {
    const filePath = path.join(__dirname, 'img/v1.png')
    const fileBuffer = await fs.readFile(filePath)
    const file = new File([fileBuffer], 'v1.png', { type: 'image/png' })

    const res = await parseCharacterPng(file)
    expect(res).not.toBeNull()
    expect(res).toBeDefined()
    expect(res.error).toBeUndefined()
    if (res.error != null) {
      throw new Error(res.error) // for the types
    }

    expect(isBackyardCharacterExportV1(res)).toBe(true)
    if (!isBackyardCharacterExportV1(res)) return // for the types
    expect(res.character.Chat).toBeDefined()
    expect(res.character.Chat.length).toEqual(1)
    expect(res.character.Chat[0].ChatItems.length).toEqual(5)
    expect(res.character.aiDisplayName).toBe('Faraday Assistant')
    expect(res.character.aiName).toBe('Faraday')
    expect(res.character.aiPersona).toBeDefined()
    expect(res.character.basePrompt).toBeDefined()
    expect(res.character.createdAt).toEqual(
      new Date('2023-11-09T22:52:54.410Z'),
    )
    expect(res.character.customDialogue).toBeDefined()
    expect(res.character.firstMessage).toBeDefined()
    expect(res.character.grammar).toEqual(null)
    expect(res.character.id).toEqual('clorsbhu20000b4d4r3wg6tni')
    expect(res.character.isNSFW).toEqual(false)
    expect(res.character.loreItems).toEqual([])
    expect(res.character.mirostatEnabled).toEqual(true)
    expect(res.character.mirostatEntropy).toEqual(5)
    expect(res.character.mirostatLearningRate).toEqual(0.1)
    expect(res.character.model).toBe('llama2.7b.luna-ai.gguf_v2.q4_k_m')
    expect(res.character.repeatLastN).toEqual(128)
    expect(res.character.repeatPenalty).toEqual(1)
    expect(res.character.scenario).toEqual('')
    expect(res.character.temperature).toEqual(0.8)
    expect(res.character.topK).toEqual(30)
    expect(res.character.topP).toEqual(0.9)
  })
})
