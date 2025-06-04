import fs from 'fs/promises'
import path from 'path'
import { describe, expect, test } from 'vitest'
import { parseCharacterPng } from '../parse-character-png'
import { isBackyardCharacterExportV4 } from '../types/character-exports'

describe('parse character card v4', () => {
  test('basic with 1000 messages', async () => {
    const filePath = path.join(__dirname, 'img/v4.png')
    const fileBuffer = await fs.readFile(filePath)
    const file = new File([fileBuffer], 'v1.png', { type: 'image/png' })

    const res = await parseCharacterPng(file)
    expect(res).not.toBeNull()
    expect(res).toBeDefined()
    expect(res.error).toBeUndefined()
    if (res.error != null) {
      throw new Error(res.error) // for the types
    }
    expect(isBackyardCharacterExportV4(res)).toBe(true)
    if (!isBackyardCharacterExportV4(res)) return // for the types
    expect(res.character.Chat).toBeDefined()
    expect(res.character.Chat.length).toEqual(0)
    expect(res.character.aiDisplayName).toBe('Kendrick')
    expect(res.character.aiName).toBe('Armstrong')
    expect(res.character.aiPersona).toBeDefined()
    expect(res.character.basePrompt).toBeDefined()
    expect(res.character.createdAt).toEqual(
      new Date('2025-06-05T20:27:40.197Z'),
    )
    expect(res.character.customDialogue).toBeDefined()
    expect(res.character.firstMessage).toBeDefined()
    expect(res.character.grammar).toEqual(null)
    expect(res.character.id).toEqual('cmbjtvokl00057if350q2gmfb')
    expect(res.character.isNSFW).toEqual(false)
    expect(res.character.loreItems.length).toEqual(8)
    expect(res.character.minP).toEqual(0.1)
    expect(res.character.minPEnabled).toEqual(true)
    expect(res.character.model).toBe('llama2.7b.luna-ai.gguf_v2.q4_k_m')
    expect(res.character.repeatLastN).toEqual(256)
    expect(res.character.repeatPenalty).toEqual(1.05)
    expect(res.character.scenario).toEqual('via virga vomica')
    expect(res.character.temperature).toEqual(1.2)
    expect(res.character.topK).toEqual(30)
    expect(res.character.topP).toEqual(0.9)
    expect(res.character.updatedAt).toEqual(
      new Date('2025-06-05T20:27:40.197Z'),
    )
  })
})
