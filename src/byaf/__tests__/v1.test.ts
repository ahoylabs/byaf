import {
  describe,
  expect,
  test,
  afterEach,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest'
import { createByaArchive } from '../create-archive'
import { mkdir, readFile, rmdir, unlink } from 'fs/promises'
import JSZip from 'jszip'
import path from 'path'
import { ByafInputCharacter, ByafInputScenario } from '../types/schemas'
import { parseByaArchive } from '../parse-archive'

// Helper to read and parse a ZIP file
const readZipFile = async (filePath: string): Promise<JSZip> => {
  const buffer = await readFile(filePath)
  return JSZip.loadAsync(buffer)
}

// Helper to read a JSON file from a ZIP
const readJsonFromZip = async (zip: JSZip, path: string): Promise<unknown> => {
  const file = zip.file(path)
  if (!file) throw new Error(`File not found in ZIP: ${path}`)
  const content = await file.async('string')
  return JSON.parse(content)
}

const pathToFile = async (path: string): Promise<File> => {
  const fileBuffer = await readFile(path)
  return new File([fileBuffer], path, { type: 'image/png' })
}

declare module 'vitest' {
  interface TestContext {
    OUTPUT_PATH: string
  }
}

describe('createByaArchive', () => {
  const TEST_DIR = path.join(__dirname, 'temp-archives')
  beforeAll(async () => {
    await mkdir(TEST_DIR, { recursive: true })
  })
  beforeEach(async (ctx) => {
    ctx.OUTPUT_PATH = path.join(TEST_DIR, `${ctx.task.id}.byaf`)
  })
  // Clean up test files after each test
  afterEach(async (ctx) => {
    try {
      await unlink(ctx.OUTPUT_PATH)
    } catch (_) {
      // Ignore errors if file doesn't exist
    }
  })
  afterAll(async () => {
    try {
      await rmdir(TEST_DIR)
    } catch (_) {
      // Ignore errors if directory doesn't exist
    }
  })

  test('creates a valid archive with basic data', async (ctx) => {
    const character: ByafInputCharacter = {
      schemaVersion: 1,
      id: 'test123',
      name: 'TestBot',
      displayName: 'Test Bot',
      isNSFW: false,
      persona: 'A test character',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loreItems: [{ key: 'test', value: 'value' }],
      images: [
        {
          file: await pathToFile(path.join(__dirname, 'images/avatar.jpg')),
          label: 'avatar',
        },
      ],
    }

    const scenario: ByafInputScenario = {
      schemaVersion: 1,
      title: 'Test Scenario',
      formattingInstructions: 'You are a test bot',
      minP: 0.1,
      minPEnabled: true,
      temperature: 0.7,
      repeatPenalty: 1.1,
      repeatLastN: 128,
      topK: 40,
      topP: 0.9,
      exampleMessages: [],
      canDeleteExampleMessages: true,
      firstMessages: [
        { characterID: 'test123', text: 'Hello, I am a test bot!' },
      ],
      narrative: 'A test scenario',
      promptTemplate: null,
      grammar: null,
      messages: Array(100).fill({
        type: 'human',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        text: 'Hello, I am a test human!',
      }),
    } satisfies ByafInputScenario

    await createByaArchive({
      outputPath: ctx.OUTPUT_PATH,
      character,
      scenarios: [scenario],
    })

    // Read and validate the ZIP file
    const zip = await readZipFile(ctx.OUTPUT_PATH)

    // Check that all expected files exist
    expect(zip.file('manifest.json')).not.toBeNull()
    expect(zip.file(`characters/${character.id}/character.json`)).not.toBeNull()
    expect(zip.file('scenarios/scenario1.json')).not.toBeNull()

    // Validate manifest
    const manifest = (await readJsonFromZip(zip, 'manifest.json')) as any
    expect(manifest.schemaVersion).toBe(1)
    expect(manifest.characters).toEqual([
      `characters/${character.id}/character.json`,
    ])
    expect(manifest.scenarios).toEqual(['scenarios/scenario1.json'])

    // Validate character data
    const characterData = (await readJsonFromZip(
      zip,
      `characters/${character.id}/character.json`,
    )) as any
    expect(characterData.schemaVersion).toBe(1)
    expect(characterData.id).toBe(character.id)
    expect(characterData.name).toBe(character.name)
    expect(characterData.loreItems).toEqual(character.loreItems)

    // Validate scenario data
    const scenarioData = (await readJsonFromZip(
      zip,
      'scenarios/scenario1.json',
    )) as any
    expect(scenarioData.schemaVersion).toBe(1)
    expect(scenarioData.title).toBe(scenario.title)
    expect(scenarioData.formattingInstructions).toBe(
      scenario.formattingInstructions,
    )
    expect(scenarioData.firstMessages).toEqual(scenario.firstMessages)
    expect(scenarioData.messages.length).toBe(100)

    // Validate that images are included in the archive
    expect(
      zip.file(`characters/${character.id}/images/avatar.jpg`),
    ).not.toBeNull()

    // Validate that the character data includes the image reference
    expect(characterData.images).toEqual([
      { path: 'images/avatar.jpg', label: 'avatar' },
    ])
  })

  test('creates archive with author information', async (ctx) => {
    const character: ByafInputCharacter = {
      schemaVersion: 1,
      id: 'test123',
      name: 'TestBot',
      displayName: 'Test Bot',
      isNSFW: false,
      persona: 'A test character',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loreItems: [{ key: 'test', value: 'value' }],
      images: [
        {
          file: await pathToFile(path.join(__dirname, 'images/avatar.jpg')),
          label: 'avatar',
        },
        {
          file: await pathToFile(path.join(__dirname, 'images/image2.png')),
          label: '',
        },
      ],
    }

    const scenario: ByafInputScenario = {
      schemaVersion: 1,
      formattingInstructions: 'You are a test bot',
      minP: 0.1,
      minPEnabled: true,
      temperature: 0.7,
      repeatPenalty: 1.1,
      repeatLastN: 128,
      topK: 40,
      topP: 0.9,
      exampleMessages: [
        { characterID: 'test123', text: 'Hello, I am a test bot!' },
      ],
      canDeleteExampleMessages: true,
      firstMessages: [
        {
          characterID: 'test123',
          text: 'Hello, I am a test bot!',
        },
      ],
      narrative: 'A test scenario',
      promptTemplate: 'general',
      grammar: null,
      messages: [
        {
          type: 'ai',
          outputs: [
            {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              activeTimestamp: new Date().toISOString(),
              text: 'Hello, I am a test bot!',
            },
          ],
        },
        {
          type: 'human',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          text: 'Hello, I am a test human!',
        },
      ],
      backgroundImage: await pathToFile(
        path.join(__dirname, 'images/image1.jpg'),
      ),
    }

    const author = {
      name: 'Test Author',
      backyardURL: 'https://backyard.ai/hub/user/test',
    }

    await createByaArchive({
      outputPath: ctx.OUTPUT_PATH,
      character,
      scenarios: [scenario],
      author,
    })

    const zip = await readZipFile(ctx.OUTPUT_PATH)
    const manifest = (await readJsonFromZip(zip, 'manifest.json')) as any
    expect(manifest.author).toEqual(author)

    const scenario1 = (await readJsonFromZip(
      zip,
      'scenarios/scenario1.json',
    )) as any

    expect(scenario1.messages).toEqual([
      {
        type: 'ai',
        outputs: [
          {
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            activeTimestamp: expect.any(String),
            text: 'Hello, I am a test bot!',
          },
        ],
      },
      {
        type: 'human',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        text: 'Hello, I am a test human!',
      },
    ])

    expect(scenario1.backgroundImage).toEqual(
      'scenarios/scenario1-background.jpg',
    )

    // Validate that images are included in the archive
    expect(
      zip.file(`characters/${character.id}/images/avatar.jpg`),
    ).not.toBeNull()
    expect(
      zip.file(`characters/${character.id}/images/image2.png`),
    ).not.toBeNull()

    const characterData = (await readJsonFromZip(
      zip,
      `characters/${character.id}/character.json`,
    )) as any

    // Validate that the character data includes the image reference
    expect(characterData.images).toEqual([
      { path: 'images/avatar.jpg', label: 'avatar' },
      { path: 'images/image2.png', label: '' },
    ])
  })

  test('creates archive with multiple scenarios', async (ctx) => {
    const character: ByafInputCharacter = {
      schemaVersion: 1,
      id: 'test123',
      name: 'TestBot',
      displayName: 'Test Bot',
      isNSFW: false,
      persona: 'A test character',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loreItems: [{ key: 'test', value: 'value' }],
      images: [
        {
          file: await pathToFile(path.join(__dirname, 'images/avatar.jpg')),
          label: 'avatar',
        },
        {
          file: await pathToFile(path.join(__dirname, 'images/image1.jpg')),
          label: 'image1',
        },
        {
          file: await pathToFile(path.join(__dirname, 'images/image2.png')),
          label: '',
        },
      ],
    }

    const baseScenario: ByafInputScenario = {
      schemaVersion: 1,
      formattingInstructions: 'You are a test bot',
      minP: 0.1,
      minPEnabled: true,
      temperature: 0.7,
      repeatPenalty: 1.1,
      repeatLastN: 128,
      topK: 40,
      topP: 0.9,
      exampleMessages: [],
      canDeleteExampleMessages: true,
      firstMessages: [
        {
          characterID: 'test123',
          text: 'Hello, I am a test bot!',
        },
      ],
      narrative: 'A test scenario',
      promptTemplate: 'general',
      grammar: null,
      messages: Array(100).fill({
        type: 'ai',
        outputs: [
          {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activeTimestamp: new Date().toISOString(),
            text: 'Hello, I am a test bot!',
          },
        ],
      }),
    }

    const scenarios = [
      baseScenario,
      { ...baseScenario, narrative: 'Second scenario' },
    ]

    await createByaArchive({
      outputPath: ctx.OUTPUT_PATH,
      character,
      scenarios,
    })

    const zip = await readZipFile(ctx.OUTPUT_PATH)
    const manifest = (await readJsonFromZip(zip, 'manifest.json')) as any
    expect(manifest.scenarios).toEqual([
      'scenarios/scenario1.json',
      'scenarios/scenario2.json',
    ])

    const scenario1 = (await readJsonFromZip(
      zip,
      'scenarios/scenario1.json',
    )) as any
    const scenario2 = (await readJsonFromZip(
      zip,
      'scenarios/scenario2.json',
    )) as any
    expect(scenario1.narrative).toBe('A test scenario')
    expect(scenario2.narrative).toBe('Second scenario')
    expect(scenario1.messages.length).toBe(100)
    expect(scenario2.messages.length).toBe(100)

    // Validate that images are included in the archive
    expect(
      zip.file(`characters/${character.id}/images/avatar.jpg`),
    ).not.toBeNull()
    expect(
      zip.file(`characters/${character.id}/images/image1.jpg`),
    ).not.toBeNull()
    expect(
      zip.file(`characters/${character.id}/images/image2.png`),
    ).not.toBeNull()

    const characterData = (await readJsonFromZip(
      zip,
      `characters/${character.id}/character.json`,
    )) as any

    // Validate that the character data includes the image reference
    expect(characterData.images).toEqual([
      { path: 'images/avatar.jpg', label: 'avatar' },
      { path: 'images/image1.jpg', label: 'image1' },
      { path: 'images/image2.png', label: '' },
    ])
  })
})

describe('parseByaArchive', () => {
  test('parses valid archive 1', async () => {
    const archive = await parseByaArchive(
      path.join(__dirname, 'test-archives/v1/1.byaf'),
    )
    if ('error' in archive) {
      throw new Error(archive.error)
    }

    expect(archive.manifest.schemaVersion).toBe(1)
    expect(archive.manifest.characters).toEqual([
      `characters/test123/character.json`,
    ])
    expect(archive.manifest.scenarios).toEqual([`scenarios/scenario1.json`])
    expect(archive.scenarios.length).toBe(1)
    expect(archive.scenarios[0].schemaVersion).toBe(1)
    expect(archive.scenarios[0].narrative).toBe('A test scenario')
    expect(archive.scenarios[0].messages.length).toBe(100)
    expect(archive.scenarios[0].messages[0].type).toBe('human')
    expect(archive.scenarios[0].backgroundImage).toBeUndefined()
    expect(archive.character.schemaVersion).toBe(1)
    expect(archive.character.id).toBe('test123')
    expect(archive.character.name).toBe('TestBot')
    expect(archive.character.displayName).toBe('Test Bot')
    expect(archive.character.isNSFW).toBe(false)
    expect(archive.character.persona).toBe('A test character')
    expect(archive.character.images).toEqual([
      { label: 'avatar', file: expect.any(File) },
    ])
  })
  test('parses valid archive 2', async () => {
    const archive = await parseByaArchive(
      path.join(__dirname, 'test-archives/v1/2.byaf'),
    )
    if ('error' in archive) {
      throw new Error(archive.error)
    }
    expect(archive.manifest.schemaVersion).toBe(1)
    expect(archive.manifest.characters).toEqual([
      `characters/test123/character.json`,
    ])
    expect(archive.manifest.scenarios).toEqual([`scenarios/scenario1.json`])
    expect(archive.scenarios.length).toBe(1)
    expect(archive.scenarios[0].schemaVersion).toBe(1)
    expect(archive.scenarios[0].narrative).toBe('A test scenario')
    expect(archive.scenarios[0].messages.length).toBe(2)
    expect(archive.scenarios[0].messages[0].type).toBe('ai')
    expect(archive.scenarios[0].backgroundImage).toEqual(expect.any(File))
    expect(archive.character.schemaVersion).toBe(1)
    expect(archive.character.id).toBe('test123')
    expect(archive.character.name).toBe('TestBot')
    expect(archive.character.displayName).toBe('Test Bot')
    expect(archive.character.isNSFW).toBe(false)
    expect(archive.character.persona).toBe('A test character')
    expect(archive.character.images).toEqual([
      { label: 'avatar', file: expect.any(File) },
      { label: '', file: expect.any(File) },
    ])
  })
  test('parses valid archive 3', async () => {
    const archive = await parseByaArchive(
      path.join(__dirname, 'test-archives/v1/3.byaf'),
    )
    if ('error' in archive) {
      throw new Error(archive.error)
    }
    expect(archive.manifest.schemaVersion).toBe(1)
    expect(archive.manifest.characters).toEqual([
      `characters/test123/character.json`,
    ])
    expect(archive.manifest.scenarios).toEqual([
      `scenarios/scenario1.json`,
      `scenarios/scenario2.json`,
    ])
    expect(archive.scenarios.length).toBe(2)
    expect(archive.scenarios[0].schemaVersion).toBe(1)
    expect(archive.scenarios[0].narrative).toBe('A test scenario')
    expect(archive.scenarios[1].schemaVersion).toBe(1)
    expect(archive.scenarios[1].narrative).toBe('Second scenario')
    expect(archive.scenarios[0].messages.length).toBe(100)
    expect(archive.scenarios[0].messages[0].type).toBe('ai')
    expect(archive.scenarios[0].backgroundImage).toBeUndefined()
    expect(archive.scenarios[1].backgroundImage).toBeUndefined()
    expect(archive.character.schemaVersion).toBe(1)
    expect(archive.character.id).toBe('test123')
    expect(archive.character.name).toBe('TestBot')
    expect(archive.character.displayName).toBe('Test Bot')
    expect(archive.character.images).toEqual([
      { label: 'avatar', file: expect.any(File) },
      { label: 'image1', file: expect.any(File) },
      { label: '', file: expect.any(File) },
    ])
  })
})
