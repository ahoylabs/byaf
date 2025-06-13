# Backyard Archive Format - `BYAF`

This repository contains the specification and implementation for Backyard AI character export formats. It defines both the legacy PNG-based format (now deprecated) and the current Backyard Archive Format (`.byaf`).

> [!Note]  
> The `BYAF` v1 spec is nearing finalization, and there will be minimal changes to v1. We are opening the spec up for feedback. If you see inconsistencies, please file an issue or open a pull request.
>
> There is still future work needed on the npm `byaf` package to have stable support for browsers and node environments. Package exports and function signatures may change without following semantic versioning until v1.0.0

## Overview

The repository provides tools and schemas for:

1. Creating and parsing Backyard Archive Format (`.byaf`) files
2. Creating and parsing character PNG files (legacy)
3. Type definitions and validation for both formats
4. Test cases and examples

## Backyard Archive Format (`.byaf`)

The Backyard Archive format (`.byaf`) is the current recommended format for character exports. It's a structured archive format that provides better organization, validation, and extensibility.

### Archive Structure

A `.byaf` file is a ZIP archive containing:

```txt
archive.byaf/
├── manifest.json           # Archive manifest
├── characters/            # Character definitions
│   └── character1/       # Character directory
│       ├── character.json # Character manifest
│       └── images/       # Character images
│           └── ...
└── scenarios/            # Scenario definitions
    ├── scenario1.json    # Scenario data
    ├── scenario2.json    # Scenario data
    └── ...

```

### Specs

The Backyard Archive Format is defined by three core specifications:

1. **Root Manifest Specification** ([`specs/v1/root-manifest.md`](./specs/v1/root-manifest.md)): Defines the structure of the root manifest file that serves as the entry point for all `.byaf` archives. It specifies how characters and scenarios are referenced, includes metadata about the archive creation, and supports optional author information. This specification ensures consistent archive organization and enables future extensibility for multi-character support.

2. **Character Specification** ([`specs/v1/character.md`](./specs/v1/character.md)): Details the character manifest format that defines individual character data within an archive. It covers character identification, persona definition, image management, and lore storage. The specification includes strict validation for image paths and supports multiple character images with labels, making it suitable for both simple and complex character definitions.

3. **Scenario Specification** ([`specs/v1/scenario.md`](./specs/v1/scenario.md)): Outlines the format for storing conversation scenarios, including message history, model settings, and formatting instructions. It supports various message types (AI and human), example messages, first messages, and comprehensive model configuration. The specification is designed to be flexible enough to support different model types while maintaining strict validation for message structure and timestamps.

Each specification is versioned independently, allowing for controlled evolution of the format while maintaining backward compatibility. The specifications are implemented as JSON Schema files in the `schemas/v1/` directory, with human-readable documentation in the `specs/v1/` directory.

### Schema Definitions

Schema definitions are available to make editing schemas easier in most text editors:

- [Root Manifest - `byaf-manifest.schema.json`](/schemas/v1/byaf-manifest.schema.json)

- [Character Manifest - `byaf-character.schema.json`](/schemas/v1/byaf-character.schema.json)
- [Scenario Manifest - `byaf-scenario.schema.json`](/schemas/v1/byaf-scenario.schema.json):

### Javascript Library

The repository provides a TypeScript library for working with `.byaf` files.

```sh
yarn add byaf
```

The library offers two main functions for parsing and creating archives:

#### Parsing Archives

```typescript
import { parseByaArchive } from 'byaf'

// Parse a .byaf file
const result = await parseByaArchive('path/to/archive.byaf')

if ('error' in result) {
  console.error('Failed to parse archive:', result.error)
} else {
  const { manifest, character, scenarios } = result
  // Use the parsed data...
}
```

The `parseByaArchive` function:

- Takes a file path to a `.byaf` file
- Validates all archive contents against the schema definitions
- Returns a typed object containing:
  - `manifest`: The archive manifest
  - `character`: The character data with embedded images
  - `scenarios`: Array of scenario definitions
- Returns an error object if parsing fails

#### Creating Archives

```typescript
import { createByaArchive } from 'byaf'

// Create a new .byaf file
const result = await createByaArchive(
  {
    outputPath: 'path/to/output.byaf',
    character: {
      id: 'character-id',
      name: 'Character Name',
      // ... other character data
      images: [
        {
          label: 'Portrait',
          file: imageFile, // File object
        },
      ],
    },
    scenarios: [
      // Array of scenario definitions
    ],
  },
  {
    validateInputs: true, // Optional: validate inputs before creating archive (useful in non-typescript envs or when parsing user inputs)
  },
)

if (result.error) {
  console.error('Failed to create archive:', result.error)
}
```

The `createByaArchive` function:

- Takes an object containing:
  - `outputPath`: Where to save the `.byaf` file
  - `character`: Character data with optional images
  - `scenarios`: Array of scenario definitions
  - `author`: Optional author information
- Optionally validates inputs against schemas
- Creates a ZIP archive with all files stored uncompressed
- Returns an error object if creation fails

Both functions are fully typed and provide runtime validation using Zod schemas. The library is designed to work in both Node.js and browser environments.

For more examples of usage, including creating archives with different configurations and handling various edge cases, please see the [test files](src/byaf/__tests__/v1.test.ts). The test suite includes examples of:

- Creating archives with basic character and scenario data
- Adding author information
- Handling multiple character images
- Working with different scenario configurations
- Validating archive contents

### Key Features

- **Extensibility**: Schema design allows for future format evolution
- **Metadata**: Comprehensive metadata tracking
- **Image Support**: Dedicated image storage with format validation
- **Scenario Management**: Structured scenario format with support for:
  - Multiple message types
  - Example messages
  - First messages
  - Narrative context
  - Model settings
  - Formatting instructions

## Character PNG Format (Deprecated)

The legacy format stored character data in PNG files using EXIF metadata. While this format is deprecated (due to limits in EXIF metadata and lack of support for multiple images & multiple characters), the repository maintains support for parsing these files for backward compatibility.

### PNG Format Implementation

The PNG format implementation consists of two main functions:

1. `createCharacterPng`: Creates a PNG file with character metadata embedded in EXIF data

   - Takes an image file and character data as input
   - Uses `exiftool-vendored` to write metadata
   - Supports quality settings for the output PNG
   - Node.js only due to EXIF tool dependencies

2. `parseCharacterPng`: Extracts character data from PNG files
   - Supports multiple image formats (PNG, JPEG, WebP, GIF)
   - Validates file size (max 10MB)
   - Extracts and decodes base64-encoded metadata
   - Supports multiple character export versions (V1-V4)
   - Handles date conversion for timestamps

The character data in PNGs evolved through several versions (V1-V4), with each version adding new features:

- V1: Basic character data with mirostat settings
- V2: Added minP and minPEnabled settings
- V3: Added promptTemplate support
- V4: Added canDeleteCustomDialogue flag

## Usage

The repository provides TypeScript types and validation functions for working with both formats. The code is designed to be used in both Node.js and browser environments (with some limitations for PNG creation which is Node.js only).

### Type Safety

All formats are defined using Zod schemas

### Testing

The repository includes test suites for:

- PNG format parsing
- Character data validation
- Archive format validation
- Version compatibility
- Edge cases and error handling

## Migration

Users of the legacy PNG format are encouraged to migrate to the `.byaf` format, which provides:

- Better organization of character data and assets
- Improved validation and type safety
- Support for multiple images
- Better scenario management
- Future extensibility

## LICENSE

MIT © 2025 Ahoy Labs, Inc.
