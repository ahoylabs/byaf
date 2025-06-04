import fs from 'fs/promises'
import path from 'path'
import { describe, expect, test } from 'vitest'
import { parseCharacterPng } from '../parse-character-png'
import { isBackyardCharacterExportV2 } from '../types/character-exports'

describe('parse character card v2', () => {
  test('basic', async () => {
    const filePath = path.join(__dirname, 'img/v2.png')
    const fileBuffer = await fs.readFile(filePath)
    const file = new File([fileBuffer], 'v1.png', { type: 'image/png' })

    const res = await parseCharacterPng(file)
    expect(res).not.toBeNull()
    expect(res).toBeDefined()
    expect(res.error).toBeUndefined()
    if (res.error != null) {
      throw new Error(res.error) // for the types
    }
    expect(isBackyardCharacterExportV2(res)).toBe(true)
    if (!isBackyardCharacterExportV2(res)) return // for the types
    expect(res.character.Chat).toBeDefined()
    expect(res.character.Chat.length).toEqual(1)
    expect(res.character.Chat[0].ChatItems.length).toEqual(0)
    expect(res.character.aiDisplayName).toBe('Faraday Assistant')
    expect(res.character.aiName).toBe('Faraday')
    expect(res.character.aiPersona).toBeDefined()
    expect(res.character.basePrompt).toBeDefined()
    expect(res.character.createdAt).toEqual(
      new Date('2023-12-18T23:31:42.483Z'),
    )
    expect(res.character.customDialogue).toBeDefined()
    expect(res.character.firstMessage).toBeDefined()
    expect(res.character.grammar).toEqual(null)
    expect(res.character.id).toEqual('clqbjvm6r0000y8uxsbz56fsb')
    expect(res.character.isNSFW).toEqual(false)
    expect(res.character.loreItems).toEqual([])
    expect(res.character.minP).toEqual(0.6)
    expect(res.character.minPEnabled).toEqual(true)
    expect(res.character.model).toBe(
      'mistral.7b.nous-capybara-v1.9.gguf_v2.q4_k_m',
    )
    expect(res.character.repeatLastN).toEqual(128)
    expect(res.character.repeatPenalty).toEqual(1)
    expect(res.character.scenario).toEqual(
      "{character} is a virtual assistant that exists on {user}'s computer.",
    )
    expect(res.character.temperature).toEqual(0.8)
    expect(res.character.topK).toEqual(30)
    expect(res.character.topP).toEqual(0.9)
    expect(res.character.updatedAt).toEqual(
      new Date('2023-12-18T23:45:48.810Z'),
    )
  })
})
